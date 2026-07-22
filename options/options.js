// VibeContent Pro - Settings Page Controller
// Version 1.1.0

document.addEventListener('DOMContentLoaded', async () => {

  // ─── DOM Elements ─────────────────────────────────────────────────────────
  const els = {
    providerSelect:           document.getElementById('providerSelect'),
    modelDropdown:            document.getElementById('modelDropdown'),
    modelInput:               document.getElementById('modelInput'),
    modelFetchStatus:         document.getElementById('modelFetchStatus'),
    refreshModelsBtn:         document.getElementById('refreshModelsBtn'),
    refreshBtnText:           document.getElementById('refreshBtnText'),
    refreshIcon:              document.getElementById('refreshIcon'),
    baseUrlInput:             document.getElementById('baseUrlInput'),
    apiKeyInput:              document.getElementById('apiKeyInput'),
    toggleKeyVisibility:      document.getElementById('toggleKeyVisibility'),
    apiKeyHint:               document.getElementById('apiKeyHint'),
    testConnectionBtn:        document.getElementById('testConnectionBtn'),
    connectionStatusIndicator:document.getElementById('connectionStatusIndicator'),
    connectionStatusText:     document.getElementById('connectionStatusText'),
    promptsList:              document.getElementById('promptsList'),
    addPromptBtn:             document.getElementById('addPromptBtn'),
    promptEditor:             document.getElementById('promptEditor'),
    promptTitleInput:         document.getElementById('promptTitleInput'),
    promptTextInput:          document.getElementById('promptTextInput'),
    savePromptBtn:            document.getElementById('savePromptBtn'),
    cancelPromptBtn:          document.getElementById('cancelPromptBtn'),

    autoSave:                 document.getElementById('autoSave'),
    clearVaultBtn:            document.getElementById('clearVaultBtn'),
    resetSettingsBtn:         document.getElementById('resetSettingsBtn'),
    saveBtn:                  document.getElementById('saveBtn'),
    saveStatus:               document.getElementById('saveStatus')
  };

  // ─── Provider Config ───────────────────────────────────────────────────────
  const DEFAULT_URLS = {
    openai:     'https://api.openai.com/v1/chat/completions',
    anthropic:  'https://api.anthropic.com/v1/messages',
    gemini:     'https://generativelanguage.googleapis.com/v1beta/models/',
    openrouter: 'https://openrouter.ai/api/v1/chat/completions',
    nvidia:     'https://integrate.api.nvidia.com/v1/chat/completions'
  };

  const HINTS = {
    openai:     '<a href="https://platform.openai.com/api-keys" target="_blank">Get OpenAI key →</a>',
    anthropic:  '<a href="https://console.anthropic.com/settings/keys" target="_blank">Get Anthropic key →</a>',
    gemini:     '<a href="https://aistudio.google.com/app/apikey" target="_blank">Get Gemini key (Free) →</a>',
    openrouter: '<a href="https://openrouter.ai/keys" target="_blank">Get OpenRouter key →</a>',
    nvidia:     '<a href="https://build.nvidia.com/" target="_blank">Get NVIDIA NIM key (Free Trial) →</a>'
  };

  // ─── Built-in Fallback Model Lists ────────────────────────────────────────
  // Conservative, real, currently-shipping IDs. The Refresh button overrides
  // these with the live list straight from the provider's /models endpoint.
  const FALLBACK_MODELS = {
    openai: [
      { id: 'gpt-4o',              name: 'GPT-4o' },
      { id: 'gpt-4o-mini',         name: 'GPT-4o Mini (Recommended)' },
      { id: 'gpt-4-turbo',         name: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo',       name: 'GPT-3.5 Turbo' },
      { id: 'o1-mini',             name: 'o1 Mini (Reasoning)' },
      { id: 'o3-mini',             name: 'o3 Mini (Reasoning)' }
    ],
    anthropic: [
      { id: 'claude-opus-4-7',           name: 'Claude Opus 4.7 (Best)' },
      { id: 'claude-sonnet-4-6',         name: 'Claude Sonnet 4.6 (Balanced)' },
      { id: 'claude-haiku-4-5',          name: 'Claude Haiku 4.5 (Fast)' },
      { id: 'claude-3-5-sonnet-latest',  name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-5-haiku-latest',   name: 'Claude 3.5 Haiku' }
    ],
    gemini: [
      { id: 'gemini-2.5-pro',        name: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash',      name: 'Gemini 2.5 Flash (Recommended)' },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
      { id: 'gemini-2.0-flash',      name: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro',        name: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash',      name: 'Gemini 1.5 Flash' }
    ],
    openrouter: [
      { id: 'google/gemini-2.0-flash-lite-preview-02-05:free', name: '🆓 Gemini 2.0 Flash Lite (Recommended)' },
      { id: 'deepseek/deepseek-chat:free',            name: '🆓 DeepSeek V3 Chat' },
      { id: 'deepseek/deepseek-r1:free',              name: '🆓 DeepSeek R1 (Reasoning)' },
      { id: 'mistralai/mistral-7b-instruct:free',     name: '🆓 Mistral 7B Instruct' },
      { id: 'anthropic/claude-3.5-sonnet',            name: '💰 Claude 3.5 Sonnet' },
      { id: 'openai/gpt-4o-mini',                     name: '💰 GPT-4o Mini' },
      { id: 'google/gemini-2.5-flash',                name: '💰 Gemini 2.5 Flash' }
    ],
    nvidia: [
      { id: 'meta/llama-3.3-70b-instruct',          name: 'Llama 3.3 70B' },
      { id: 'meta/llama-3.1-70b-instruct',          name: 'Llama 3.1 70B' },
      { id: 'meta/llama-3.1-405b-instruct',         name: 'Llama 3.1 405B' },
      { id: 'deepseek-ai/deepseek-r1',              name: 'DeepSeek R1' },
      { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'Nemotron 70B' },
      { id: 'mistralai/mixtral-8x22b-instruct-v0.1', name: 'Mixtral 8x22B' },
      { id: 'microsoft/phi-3-medium-128k-instruct', name: 'Phi-3 Medium 128k' },
      { id: 'google/gemma-2-27b-it',                name: 'Gemma 2 27B' }
    ]
  };

  // ─── App State ─────────────────────────────────────────────────────────────
  function buildDefaultSettings() {
    return {
      provider: 'gemini',
      providersConfig: {
        openai:     { url: DEFAULT_URLS.openai,     key: '', model: 'gpt-4o-mini' },
        anthropic:  { url: DEFAULT_URLS.anthropic,  key: '', model: 'claude-3-5-haiku-latest' },
        gemini:     { url: DEFAULT_URLS.gemini,     key: '', model: 'gemini-2.0-flash' },
        openrouter: { url: DEFAULT_URLS.openrouter, key: '', model: 'google/gemini-2.0-flash-exp:free' },
        nvidia:     { url: DEFAULT_URLS.nvidia,     key: '', model: 'meta/llama-3.3-70b-instruct' }
      },
      autoSave: false,
      language: 'en',
      customPrompts: [
        { id: 'default-1', title: 'Viral Twitter Thread', text: 'Write a highly engaging, viral 5-part Twitter thread about the source content. Use emojis, short sentences, and a strong hook in the first tweet.' }
      ]
    };
  }

  let currentSettings = buildDefaultSettings();
  const liveModelsCache = {}; // Live-fetched models per provider

  // ─── Live Model Fetching ───────────────────────────────────────────────────
  // Adds a 15s timeout so the UI never hangs on a bad key / slow network.
  function fetchWithTimeout(url, opts = {}, ms = 15000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { ...opts, signal: controller.signal })
      .finally(() => clearTimeout(timer));
  }

  async function safeReadError(res) {
    const text = await res.text().catch(() => '');
    try {
      const json = JSON.parse(text);
      return json?.error?.message || json?.detail || json?.message || `HTTP ${res.status}`;
    } catch {
      return text ? text.slice(0, 200) : `HTTP ${res.status}`;
    }
  }

  async function fetchLiveModels(provider) {
    const config = currentSettings.providersConfig[provider] || {};
    const apiKey = (els.apiKeyInput.value.trim()) || config.key || '';

    switch (provider) {
      case 'openrouter': {
        // OpenRouter exposes /models without auth
        const res = await fetchWithTimeout('https://openrouter.ai/api/v1/models', {
          headers: { 'HTTP-Referer': 'https://vibecontent.pro', 'X-Title': 'VibeContent Pro' }
        });
        if (!res.ok) throw new Error(`OpenRouter: ${await safeReadError(res)}`);
        const data = await res.json();
        return (data.data || [])
          .sort((a, b) => (a.id > b.id ? 1 : -1))
          .map(m => {
            const isFree = m?.pricing?.prompt === '0' || m?.id?.endsWith(':free');
            return {
              id: m.id,
              name: (isFree ? '🆓 ' : '💰 ') + (m.name || m.id)
            };
          });
      }

      case 'openai': {
        if (!apiKey) throw new Error('Paste your OpenAI API key first, then click Refresh.');
        const res = await fetchWithTimeout('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!res.ok) throw new Error(`OpenAI: ${await safeReadError(res)}`);
        const data = await res.json();
        return (data.data || [])
          .filter(m => /^(gpt|o\d|chatgpt)/i.test(m.id))
          .sort((a, b) => (b.created || 0) - (a.created || 0))
          .map(m => ({ id: m.id, name: m.id }));
      }

      case 'gemini': {
        if (!apiKey) throw new Error('Paste your Gemini API key first, then click Refresh.');
        const res = await fetchWithTimeout(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
        );
        if (!res.ok) throw new Error(`Gemini: ${await safeReadError(res)}`);
        const data = await res.json();
        const list = (data.models || [])
          .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
          .map(m => ({
            id: m.name.replace(/^models\//, ''),
            name: m.displayName || m.name.replace(/^models\//, '')
          }));
        // Push "latest" / "flash" first for nicer UX
        list.sort((a, b) => {
          const score = (s) => (/flash/i.test(s) ? 0 : 1) + (/pro/i.test(s) ? 0 : 0.5);
          return score(a.name) - score(b.name);
        });
        return list;
      }

      case 'anthropic': {
        if (!apiKey) throw new Error('Paste your Anthropic API key first, then click Refresh.');
        const res = await fetchWithTimeout('https://api.anthropic.com/v1/models', {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          }
        });
        if (!res.ok) throw new Error(`Anthropic: ${await safeReadError(res)}`);
        const data = await res.json();
        return (data.data || data.models || []).map(m => ({
          id: m.id,
          name: m.display_name || m.id
        }));
      }

      case 'nvidia': {
        if (!apiKey) throw new Error('Paste your NVIDIA NIM API key first, then click Refresh.');
        const res = await fetchWithTimeout('https://integrate.api.nvidia.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error(`NVIDIA NIM: ${await safeReadError(res)}`);
        const data = await res.json();
        return (data.data || [])
          .map(m => ({ id: m.id, name: m.id }))
          .sort((a, b) => (a.id > b.id ? 1 : -1));
      }

      default:
        throw new Error(`Live fetch not supported for provider: ${provider}`);
    }
  }

  // ─── Model Dropdown Render ─────────────────────────────────────────────────
  function populateModelDropdown(models, savedModel) {
    const dropdown = els.modelDropdown;
    dropdown.innerHTML = '';

    models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      dropdown.appendChild(opt);
    });

    const customOpt = document.createElement('option');
    customOpt.value = '__custom__';
    customOpt.textContent = '✏️ Enter Custom Model ID...';
    dropdown.appendChild(customOpt);

    const isPreset = models.find(m => m.id === savedModel);
    if (isPreset) {
      dropdown.value = savedModel;
      els.modelInput.style.display = 'none';
    } else if (savedModel) {
      dropdown.value = '__custom__';
      els.modelInput.style.display = 'block';
      els.modelInput.value = savedModel;
    } else {
      dropdown.selectedIndex = 0;
      els.modelInput.style.display = 'none';
    }
  }

  function updateUIForProvider(provider) {
    const config = currentSettings.providersConfig[provider] || {};
    const models = liveModelsCache[provider] || FALLBACK_MODELS[provider] || [];
    populateModelDropdown(models, config.model);

    els.baseUrlInput.value = config.url || DEFAULT_URLS[provider];
    els.apiKeyInput.value  = config.key || '';
    els.apiKeyHint.innerHTML = HINTS[provider] || '';

    els.modelFetchStatus.style.display = 'none';
    els.modelFetchStatus.textContent = '';

    // Clear test status when provider changes
    setConnectionStatus('#444', '', 'var(--text-light)');
  }

  function getCurrentModel() {
    return els.modelDropdown.value === '__custom__'
      ? els.modelInput.value.trim()
      : els.modelDropdown.value;
  }

  function setConnectionStatus(color, text, textColor) {
    els.connectionStatusIndicator.style.backgroundColor = color;
    els.connectionStatusText.textContent = text;
    els.connectionStatusText.style.color = textColor || color;
  }

  // ─── Refresh Button Handler ────────────────────────────────────────────────
  let refreshInFlight = false;
  async function handleRefreshModels() {
    if (refreshInFlight) return;
    refreshInFlight = true;
    const provider = els.providerSelect.value;
    const apiKey   = els.apiKeyInput.value.trim();

    // Persist current key into in-memory state immediately so a follow-up Save
    // (or provider switch) doesn't lose what the user just typed.
    if (!currentSettings.providersConfig[provider]) {
      currentSettings.providersConfig[provider] = { url: DEFAULT_URLS[provider], key: '', model: '' };
    }
    currentSettings.providersConfig[provider].key = apiKey;
    currentSettings.providersConfig[provider].url = els.baseUrlInput.value.trim() || DEFAULT_URLS[provider];

    els.refreshModelsBtn.disabled = true;
    els.refreshBtnText.textContent = 'Fetching...';
    els.refreshIcon.style.animation = 'spin 1s linear infinite';
    els.modelFetchStatus.style.display = 'block';
    els.modelFetchStatus.style.color = 'var(--text-light)';
    els.modelFetchStatus.textContent = '⏳ Fetching live models from ' + provider + '...';

    try {
      const models = await fetchLiveModels(provider);
      if (!models.length) throw new Error('Provider returned no models');
      liveModelsCache[provider] = models;

      const currentModel = getCurrentModel() || currentSettings.providersConfig[provider]?.model;
      // If currently-selected model no longer exists in the live list, fall back to the first one
      const preferred = models.find(m => m.id === currentModel)?.id || models[0].id;
      populateModelDropdown(models, preferred);
      currentSettings.providersConfig[provider].model = preferred;

      els.modelFetchStatus.style.color = 'var(--success)';
      els.modelFetchStatus.textContent = `✅ Loaded ${models.length} live models from ${provider}.`;
    } catch (err) {
      const isAbort = err?.name === 'AbortError';
      els.modelFetchStatus.style.color = 'var(--danger)';
      els.modelFetchStatus.textContent =
        `⚠️ ${isAbort ? 'Request timed out' : err.message}. Showing built-in list — paste a valid key and try again.`;
    } finally {
      els.refreshModelsBtn.disabled = false;
      els.refreshBtnText.textContent = 'Refresh';
      els.refreshIcon.style.animation = '';
      refreshInFlight = false;
    }
  }

  // ─── Event Listeners ───────────────────────────────────────────────────────

  // Provider change: persist current fields into old provider, load new one
  els.providerSelect.addEventListener('change', (e) => {
    const oldProvider = currentSettings.provider;
    if (currentSettings.providersConfig[oldProvider]) {
      currentSettings.providersConfig[oldProvider].url   = els.baseUrlInput.value.trim();
      currentSettings.providersConfig[oldProvider].model = getCurrentModel();
      currentSettings.providersConfig[oldProvider].key   = els.apiKeyInput.value.trim();
    }
    currentSettings.provider = e.target.value;
    updateUIForProvider(currentSettings.provider);
  });

  // Model dropdown change: show/hide custom input
  els.modelDropdown.addEventListener('change', (e) => {
    if (e.target.value === '__custom__') {
      els.modelInput.style.display = 'block';
      els.modelInput.focus();
    } else {
      els.modelInput.style.display = 'none';
      els.modelInput.value = '';
    }
  });

  // Refresh button
  els.refreshModelsBtn.addEventListener('click', handleRefreshModels);

  // API key field: pasting a key auto-refreshes the model list after a short debounce.
  let pasteRefreshTimer = null;
  function schedulePasteRefresh() {
    clearTimeout(pasteRefreshTimer);
    const value = els.apiKeyInput.value.trim();
    if (!value || value.length < 8) return;
    pasteRefreshTimer = setTimeout(() => {
      // Only auto-refresh if we haven't already cached live models for this provider
      const provider = els.providerSelect.value;
      if (!liveModelsCache[provider]) handleRefreshModels();
    }, 600);
  }
  els.apiKeyInput.addEventListener('paste', () => setTimeout(schedulePasteRefresh, 50));
  els.apiKeyInput.addEventListener('input', schedulePasteRefresh);

  // Show/hide API key
  els.toggleKeyVisibility.addEventListener('click', () => {
    const isPassword = els.apiKeyInput.type === 'password';
    els.apiKeyInput.type = isPassword ? 'text' : 'password';
    els.toggleKeyVisibility.textContent = isPassword ? 'Hide' : 'Show';
  });



  // Custom Prompts
  let editingPromptId = null;

  els.addPromptBtn.addEventListener('click', () => {
    editingPromptId = null;
    els.promptTitleInput.value = '';
    els.promptTextInput.value = '';
    els.promptEditor.classList.remove('hidden');
    els.addPromptBtn.classList.add('hidden');
  });

  els.cancelPromptBtn.addEventListener('click', () => {
    els.promptEditor.classList.add('hidden');
    els.addPromptBtn.classList.remove('hidden');
  });

  els.savePromptBtn.addEventListener('click', () => {
    const title = els.promptTitleInput.value.trim();
    const text = els.promptTextInput.value.trim();
    if (!title || !text) {
      showStatus('Title and Instructions are required.', 'error');
      return;
    }
    
    if (!currentSettings.customPrompts) currentSettings.customPrompts = [];
    
    if (editingPromptId) {
      const p = currentSettings.customPrompts.find(x => x.id === editingPromptId);
      if (p) {
        p.title = title;
        p.text = text;
      }
    } else {
      currentSettings.customPrompts.push({
        id: 'prompt_' + Date.now(),
        title,
        text
      });
    }
    
    els.promptEditor.classList.add('hidden');
    els.addPromptBtn.classList.remove('hidden');
    saveSettings();
    renderPromptsList();
  });

  // Save button
  els.saveBtn.addEventListener('click', saveSettings);

  // Test Connection button — also writes settings on success so the sidepanel
  // is guaranteed to pick up the working key without an extra Save click.
  els.testConnectionBtn.addEventListener('click', async () => {
    const provider = els.providerSelect.value;
    const url      = els.baseUrlInput.value.trim();
    const model    = getCurrentModel();
    const apiKey   = els.apiKeyInput.value.trim();

    if (!apiKey) { setConnectionStatus('var(--danger)', 'Please enter an API key first'); return; }
    if (!url || !url.startsWith('https://')) { setConnectionStatus('var(--danger)', 'A secure Base URL (https://) is required'); return; }
    if (!model)  { setConnectionStatus('var(--danger)', 'Please select or enter a model ID'); return; }

    els.testConnectionBtn.disabled = true;
    els.testConnectionBtn.textContent = 'Testing...';
    setConnectionStatus('#f1c40f', 'Connecting...', 'var(--text-light)');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'testApiConnection',
        data: { provider, url, model, apiKey }
      });

      if (response && response.success) {
        // Persist immediately so the side panel sees the working key right away.
        currentSettings.provider = provider;
        if (!currentSettings.providersConfig[provider]) currentSettings.providersConfig[provider] = {};
        currentSettings.providersConfig[provider].url   = url;
        currentSettings.providersConfig[provider].model = model;
        currentSettings.providersConfig[provider].key   = apiKey;
        await chrome.storage.local.set({ settings: currentSettings });
        setConnectionStatus('var(--success)', 'Connected — settings saved');
      } else {
        throw new Error(response?.error || 'Unknown error');
      }
    } catch (error) {
      setConnectionStatus('var(--danger)', `Failed: ${error.message}`);
    } finally {
      els.testConnectionBtn.disabled = false;
      els.testConnectionBtn.textContent = 'Test Connection';
    }
  });

  // Clear vault
  els.clearVaultBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete ALL saved content? This cannot be undone.')) {
      await chrome.storage.local.set({ vault: [] });
      showStatus('Vault cleared successfully', 'success');
    }
  });

  // Reset settings
  els.resetSettingsBtn.addEventListener('click', async () => {
    if (confirm('Reset all settings to defaults? This will erase all saved API keys.')) {
      currentSettings = buildDefaultSettings();
      await chrome.storage.local.set({ settings: currentSettings });
      applySettingsToUI();
      showStatus('Settings reset to defaults', 'success');
    }
  });

  // ─── Core Functions ────────────────────────────────────────────────────────
  function renderPromptsList() {
    els.promptsList.innerHTML = '';
    const prompts = currentSettings.customPrompts || [];
    
    if (prompts.length === 0) {
      els.promptsList.innerHTML = '<p style="color: var(--text-light); font-size: 13px;">No custom prompts yet. Create one!</p>';
      return;
    }

    prompts.forEach(p => {
      const div = document.createElement('div');
      div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid var(--border);';
      
      div.innerHTML = `
        <div style="flex: 1; overflow: hidden; margin-right: 10px;">
          <div style="font-weight: 500; font-size: 14px; margin-bottom: 4px;">${escapeHtml(p.title)}</div>
          <div style="font-size: 12px; color: var(--text-light); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(p.text)}</div>
        </div>
        <div style="display: flex; gap: 6px; flex-shrink: 0;">
          <button class="edit-btn save-btn secondary" style="padding: 4px 8px; font-size: 11px;" data-id="${p.id}">Edit</button>
          <button class="delete-btn danger-btn" style="padding: 4px 8px; font-size: 11px;" data-id="${p.id}">Delete</button>
        </div>
      `;
      els.promptsList.appendChild(div);
    });

    els.promptsList.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const p = currentSettings.customPrompts.find(x => x.id === id);
        if (p) {
          editingPromptId = id;
          els.promptTitleInput.value = p.title;
          els.promptTextInput.value = p.text;
          els.promptEditor.classList.remove('hidden');
          els.addPromptBtn.classList.add('hidden');
        }
      });
    });

    els.promptsList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        currentSettings.customPrompts = currentSettings.customPrompts.filter(x => x.id !== id);
        saveSettings();
        renderPromptsList();
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function applySettingsToUI() {
    els.providerSelect.value  = currentSettings.provider || 'gemini';
    updateUIForProvider(els.providerSelect.value);

    els.autoSave.checked      = currentSettings.autoSave === true;
    renderPromptsList();
  }

  async function loadSettings() {
    const result = await chrome.storage.local.get(['settings']);
    if (result.settings) {
      const defaults = buildDefaultSettings();
      currentSettings = {
        ...defaults,
        ...result.settings,
        providersConfig: {
          ...defaults.providersConfig,
          ...(result.settings.providersConfig || {})
        }
      };

      // Legacy migration: single apiKey/model into the new providersConfig shape
      if (!result.settings.providersConfig && result.settings.apiKey) {
        const p = currentSettings.provider;
        currentSettings.providersConfig[p].key   = result.settings.apiKey;
        currentSettings.providersConfig[p].model = result.settings.model || defaults.providersConfig[p].model;
      }
    }
    applySettingsToUI();
  }

  async function saveSettings() {
    try {
      const provider = els.providerSelect.value;
      currentSettings.provider = provider;
      if (!currentSettings.providersConfig[provider]) {
        currentSettings.providersConfig[provider] = {};
      }
      currentSettings.providersConfig[provider].url   = els.baseUrlInput.value.trim() || DEFAULT_URLS[provider];
      currentSettings.providersConfig[provider].model = getCurrentModel();
      currentSettings.providersConfig[provider].key   = els.apiKeyInput.value.trim();


      currentSettings.autoSave        = els.autoSave.checked;

      // chrome.storage.local only — keys never sync, never leave the device.
      await chrome.storage.local.set({ settings: currentSettings });

      const hasKey = !!currentSettings.providersConfig[provider].key;
      const hasModel = !!currentSettings.providersConfig[provider].model;
      if (!hasKey) {
        showStatus('Saved, but no API key set for ' + provider + '.', 'error');
      } else if (!hasModel) {
        showStatus('Saved, but no model selected for ' + provider + '.', 'error');
      } else {
        showStatus('Settings saved successfully!', 'success');
      }
    } catch (error) {
      showStatus('Failed to save: ' + error.message, 'error');
    }
  }

  function showStatus(message, type) {
    els.saveStatus.textContent = message;
    els.saveStatus.className = 'save-status show ' + type;
    setTimeout(() => els.saveStatus.classList.remove('show'), 3000);
  }

  // ─── Bootstrap ────────────────────────────────────────────────────────────
  await loadSettings();

});
