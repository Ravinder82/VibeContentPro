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
    defaultPersona:           document.getElementById('defaultPersona'),
    defaultPlatform:          document.getElementById('defaultPlatform'),
    defaultMode:              document.getElementById('defaultMode'),
    defaultTemp:              document.getElementById('defaultTemp'),
    defaultTempValue:         document.getElementById('defaultTempValue'),
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

  // ─── Built-in Fallback Model Lists (up-to-date May 2026) ──────────────────
  // These are shown instantly on first load. The "Refresh" button fetches live from APIs.
  const FALLBACK_MODELS = {
    openai: [
      { id: 'gpt-5.5',                     name: 'GPT-5.5 (Flagship)' },
      { id: 'gpt-5.4',                      name: 'GPT-5.4' },
      { id: 'gpt-5.4-mini',                 name: 'GPT-5.4 Mini' },
      { id: 'o3-pro',                        name: 'o3 Pro (Deep Reasoning)' },
      { id: 'o3',                            name: 'o3 (Reasoning)' },
      { id: 'o3-mini',                       name: 'o3 Mini (Fast Reasoning)' },
      { id: 'gpt-4-turbo',                   name: 'GPT-4 Turbo (Legacy)' },
      { id: 'gpt-3.5-turbo',                 name: 'GPT-3.5 Turbo (Legacy)' },
    ],
    anthropic: [
      { id: 'claude-opus-4-7',               name: 'Claude Opus 4.7 (Best)' },
      { id: 'claude-sonnet-4-6',             name: 'Claude Sonnet 4.6 (Balanced)' },
      { id: 'claude-haiku-4-5',              name: 'Claude Haiku 4.5 (Fast)' },
      { id: 'claude-3-7-sonnet-20250219',    name: 'Claude 3.7 Sonnet (Hybrid Thinking)' },
      { id: 'claude-3-5-sonnet-latest',      name: 'Claude 3.5 Sonnet (Older)' },
      { id: 'claude-3-5-haiku-latest',       name: 'Claude 3.5 Haiku (Older)' },
    ],
    gemini: [
      { id: 'gemini-3.5-flash',              name: 'Gemini 3.5 Flash (Latest)' },
      { id: 'gemini-3.1-pro-preview',        name: 'Gemini 3.1 Pro Preview' },
      { id: 'gemini-3.1-flash-lite',         name: 'Gemini 3.1 Flash Lite (Cost-Efficient)' },
      { id: 'gemini-2.5-pro',                name: 'Gemini 2.5 Pro (Stable)' },
      { id: 'gemini-2.5-flash',              name: 'Gemini 2.5 Flash (Stable)' },
      { id: 'gemini-2.5-flash-lite',         name: 'Gemini 2.5 Flash Lite' },
      { id: 'gemini-2.0-flash',              name: 'Gemini 2.0 Flash (Legacy)' },
      { id: 'gemini-1.5-flash',              name: 'Gemini 1.5 Flash (Legacy)' },
      { id: 'gemini-1.5-pro',                name: 'Gemini 1.5 Pro (Legacy)' },
    ],
    openrouter: [
      // Free models
      { id: 'google/gemini-2.0-flash-exp:free',          name: '🆓 Gemini 2.0 Flash Exp' },
      { id: 'deepseek/deepseek-r1:free',                 name: '🆓 DeepSeek R1 (Reasoning)' },
      { id: 'deepseek/deepseek-chat:free',               name: '🆓 DeepSeek V3 Chat' },
      { id: 'meta-llama/llama-4-scout:free',             name: '🆓 Llama 4 Scout' },
      { id: 'meta-llama/llama-3.3-70b-instruct:free',    name: '🆓 Llama 3.3 70B' },
      { id: 'qwen/qwen3-235b-a22b:free',                 name: '🆓 Qwen 3 235B' },
      { id: 'microsoft/phi-4-reasoning:free',            name: '🆓 Phi-4 Reasoning' },
      { id: 'mistralai/mistral-7b-instruct:free',        name: '🆓 Mistral 7B Instruct' },
      // Paid models
      { id: 'anthropic/claude-opus-4',                   name: '💰 Claude Opus 4' },
      { id: 'anthropic/claude-sonnet-4-5',               name: '💰 Claude Sonnet 4.5' },
      { id: 'openai/gpt-5.4',                            name: '💰 GPT-5.4' },
      { id: 'openai/o3',                                 name: '💰 o3 (Reasoning)' },
      { id: 'google/gemini-3.5-flash',                   name: '💰 Gemini 3.5 Flash' },
      { id: 'x-ai/grok-3',                               name: '💰 Grok 3' },
      { id: 'mistralai/mistral-large-2',                 name: '💰 Mistral Large 2' },
    ],
    nvidia: [
      { id: 'meta/llama-4-scout-17b-16e-instruct',      name: 'Llama 4 Scout 17B' },
      { id: 'meta/llama-4-maverick-17b-128e-instruct',  name: 'Llama 4 Maverick 17B' },
      { id: 'meta/llama-3.1-70b-instruct',              name: 'Llama 3.1 70B' },
      { id: 'meta/llama-3.1-405b-instruct',             name: 'Llama 3.1 405B' },
      { id: 'deepseek-ai/deepseek-r1',                  name: 'DeepSeek R1' },
      { id: 'nvidia/nemotron-4-340b-instruct',          name: 'Nemotron-4 340B' },
      { id: 'qwen/qwen3-235b-a22b',                     name: 'Qwen 3 235B' },
      { id: 'mistralai/mistral-large-2-instruct',       name: 'Mistral Large 2' },
      { id: 'microsoft/phi-4',                          name: 'Phi-4' },
      { id: 'google/gemma-3-27b-it',                    name: 'Gemma 3 27B' },
    ]
  };

  // ─── App State ─────────────────────────────────────────────────────────────
  let currentSettings = {
    provider: 'openai',
    providersConfig: {
      openai:     { url: DEFAULT_URLS.openai,     key: '', model: 'gpt-5.5' },
      anthropic:  { url: DEFAULT_URLS.anthropic,  key: '', model: 'claude-sonnet-4-6' },
      gemini:     { url: DEFAULT_URLS.gemini,     key: '', model: 'gemini-2.5-flash' },
      openrouter: { url: DEFAULT_URLS.openrouter, key: '', model: 'google/gemini-2.0-flash-exp:free' },
      nvidia:     { url: DEFAULT_URLS.nvidia,     key: '', model: 'meta/llama-4-scout-17b-16e-instruct' }
    },
    defaultPersona: 'storyteller',
    defaultPlatform: 'linkedin',
    defaultMode: 'rephrase',
    autoSave: true,
    language: 'en',
    temperature: 0.85
  };

  // Runtime cache for live-fetched models (keyed by provider)
  const liveModelsCache = {};

  // ─── Live Model Fetching ───────────────────────────────────────────────────
  /**
   * Fetches the live model list from the provider's own API.
   * Only OpenRouter has a public unauthenticated models endpoint.
   * For others, we use the key stored in settings to call their models endpoint.
   */
  async function fetchLiveModels(provider) {
    const config = currentSettings.providersConfig[provider] || {};
    const apiKey = config.key || els.apiKeyInput.value.trim();

    switch (provider) {
      case 'openrouter': {
        // OpenRouter has a free public models endpoint — no auth needed
        const res = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { 'HTTP-Referer': 'https://vibecontent.pro', 'X-Title': 'VibeContent Pro' }
        });
        if (!res.ok) throw new Error(`OpenRouter API error: ${res.status}`);
        const data = await res.json();
        return data.data
          .sort((a, b) => (a.id > b.id ? 1 : -1))
          .map(m => ({
            id: m.id,
            name: (m.pricing?.prompt === '0' ? '🆓 ' : '💰 ') + (m.name || m.id)
          }));
      }

      case 'openai': {
        if (!apiKey) throw new Error('API key required to fetch OpenAI models');
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
        const data = await res.json();
        // Filter to only relevant chat models
        return data.data
          .filter(m => m.id.startsWith('gpt') || m.id.startsWith('o1') || m.id.startsWith('o3') || m.id.startsWith('o4'))
          .sort((a, b) => b.created - a.created)
          .map(m => ({ id: m.id, name: m.id }));
      }

      case 'gemini': {
        if (!apiKey) throw new Error('API key required to fetch Gemini models');
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
        const data = await res.json();
        return (data.models || [])
          .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
          .map(m => ({
            id: m.name.replace('models/', ''),
            name: m.displayName || m.name.replace('models/', '')
          }));
      }

      case 'anthropic': {
        if (!apiKey) throw new Error('API key required to fetch Anthropic models');
        const res = await fetch('https://api.anthropic.com/v1/models', {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          }
        });
        if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
        const data = await res.json();
        return (data.models || data.data || []).map(m => ({
          id: m.id,
          name: m.display_name || m.id
        }));
      }

      case 'nvidia': {
        if (!apiKey) throw new Error('API key required to fetch NVIDIA NIM models');
        const res = await fetch('https://integrate.api.nvidia.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!res.ok) throw new Error(`NVIDIA API error: ${res.status}`);
        const data = await res.json();
        return (data.data || []).map(m => ({ id: m.id, name: m.id }));
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

    // Always add custom option at the bottom
    const customOpt = document.createElement('option');
    customOpt.value = '__custom__';
    customOpt.textContent = '✏️ Enter Custom Model ID...';
    dropdown.appendChild(customOpt);

    // Restore saved selection
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

  // ─── Update full UI for a given provider ──────────────────────────────────
  function updateUIForProvider(provider) {
    const config = currentSettings.providersConfig[provider] || {};

    // Use live-fetched models if cached, else fallback
    const models = liveModelsCache[provider] || FALLBACK_MODELS[provider] || [];
    populateModelDropdown(models, config.model);

    els.baseUrlInput.value = config.url || DEFAULT_URLS[provider];
    els.apiKeyInput.value  = config.key || '';
    els.apiKeyHint.innerHTML = HINTS[provider] || '';

    // Reset fetch status
    els.modelFetchStatus.style.display = 'none';
    els.modelFetchStatus.textContent = '';
  }

  function getCurrentModel() {
    return els.modelDropdown.value === '__custom__'
      ? els.modelInput.value.trim()
      : els.modelDropdown.value;
  }

  // ─── Refresh Button Handler ────────────────────────────────────────────────
  async function handleRefreshModels() {
    const provider = els.providerSelect.value;
    const apiKey   = els.apiKeyInput.value.trim();

    // Temporarily store the key so fetchLiveModels can read it
    if (!currentSettings.providersConfig[provider]) {
      currentSettings.providersConfig[provider] = {};
    }
    currentSettings.providersConfig[provider].key = apiKey;

    // UI loading state
    els.refreshModelsBtn.disabled = true;
    els.refreshBtnText.textContent = 'Fetching...';
    els.refreshIcon.style.animation = 'spin 1s linear infinite';
    els.modelFetchStatus.style.display = 'block';
    els.modelFetchStatus.style.color = 'var(--text-light)';
    els.modelFetchStatus.textContent = '⏳ Fetching live models from provider...';

    try {
      const models = await fetchLiveModels(provider);
      liveModelsCache[provider] = models;

      const currentModel = getCurrentModel();
      populateModelDropdown(models, currentModel || currentSettings.providersConfig[provider]?.model);

      els.modelFetchStatus.style.color = 'var(--success)';
      els.modelFetchStatus.textContent = `✅ ${models.length} models loaded live`;
    } catch (err) {
      els.modelFetchStatus.style.color = 'var(--danger)';
      els.modelFetchStatus.textContent = `⚠️ Live fetch failed: ${err.message}. Showing built-in list.`;
    } finally {
      els.refreshModelsBtn.disabled = false;
      els.refreshBtnText.textContent = 'Refresh';
      els.refreshIcon.style.animation = '';
    }
  }

  // ─── Event Listeners ───────────────────────────────────────────────────────

  // Provider change: save current state, load new provider
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

  // Show/hide API key
  els.toggleKeyVisibility.addEventListener('click', () => {
    const isPassword = els.apiKeyInput.type === 'password';
    els.apiKeyInput.type = isPassword ? 'text' : 'password';
    els.toggleKeyVisibility.textContent = isPassword ? 'Hide' : 'Show';
  });

  // Temperature slider
  els.defaultTemp.addEventListener('input', (e) => {
    els.defaultTempValue.textContent = e.target.value;
  });

  // Save button
  els.saveBtn.addEventListener('click', saveSettings);

  // Test Connection button
  els.testConnectionBtn.addEventListener('click', async () => {
    const provider = els.providerSelect.value;
    const url      = els.baseUrlInput.value.trim();
    const model    = getCurrentModel();
    const apiKey   = els.apiKeyInput.value.trim();

    const setStatus = (color, text, textColor) => {
      els.connectionStatusIndicator.style.backgroundColor = color;
      els.connectionStatusText.textContent = text;
      els.connectionStatusText.style.color = textColor || color;
    };

    if (!apiKey)                        { setStatus('var(--danger)', 'Please enter an API key first'); return; }
    if (!url || !url.startsWith('https://')) { setStatus('var(--danger)', 'A secure Base URL (https://) is required'); return; }
    if (!model)                         { setStatus('var(--danger)', 'Please select or enter a model ID'); return; }

    els.testConnectionBtn.disabled = true;
    els.testConnectionBtn.textContent = 'Testing...';
    setStatus('#f1c40f', 'Connecting...', 'var(--text-light)');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'testApiConnection',
        data: { provider, url, model, apiKey }
      });

      if (response && response.success) {
        setStatus('var(--success)', 'Connected successfully!');
      } else {
        throw new Error(response?.error || 'Unknown error');
      }
    } catch (error) {
      setStatus('var(--danger)', `Failed: ${error.message}`);
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

  function buildDefaultSettings() {
    return {
      provider: 'openai',
      providersConfig: {
        openai:     { url: DEFAULT_URLS.openai,     key: '', model: 'gpt-5.5' },
        anthropic:  { url: DEFAULT_URLS.anthropic,  key: '', model: 'claude-sonnet-4-6' },
        gemini:     { url: DEFAULT_URLS.gemini,     key: '', model: 'gemini-2.5-flash' },
        openrouter: { url: DEFAULT_URLS.openrouter, key: '', model: 'google/gemini-2.0-flash-exp:free' },
        nvidia:     { url: DEFAULT_URLS.nvidia,     key: '', model: 'meta/llama-4-scout-17b-16e-instruct' }
      },
      defaultPersona: 'storyteller',
      defaultPlatform: 'linkedin',
      defaultMode: 'rephrase',
      autoSave: true,
      language: 'en',
      temperature: 0.85
    };
  }

  function applySettingsToUI() {
    els.providerSelect.value  = currentSettings.provider || 'openai';
    updateUIForProvider(els.providerSelect.value);
    els.defaultPersona.value  = currentSettings.defaultPersona  || 'storyteller';
    els.defaultPlatform.value = currentSettings.defaultPlatform || 'linkedin';
    els.defaultMode.value     = currentSettings.defaultMode     || 'rephrase';
    els.defaultTemp.value     = currentSettings.temperature     || 0.85;
    els.defaultTempValue.textContent = currentSettings.temperature || 0.85;
    els.autoSave.checked      = currentSettings.autoSave !== false;
  }

  async function loadSettings() {
    const result = await chrome.storage.local.get(['settings']);
    if (result.settings) {
      // Deep merge: start from defaults so new providers always have their defaults
      const defaults = buildDefaultSettings();
      currentSettings = {
        ...defaults,
        ...result.settings,
        providersConfig: {
          ...defaults.providersConfig,
          ...(result.settings.providersConfig || {})
        }
      };

      // Migration: if old single-key format, migrate to new format
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
      currentSettings.providersConfig[provider].url   = els.baseUrlInput.value.trim();
      currentSettings.providersConfig[provider].model = getCurrentModel();
      currentSettings.providersConfig[provider].key   = els.apiKeyInput.value.trim();

      currentSettings.defaultPersona  = els.defaultPersona.value;
      currentSettings.defaultPlatform = els.defaultPlatform.value;
      currentSettings.defaultMode     = els.defaultMode.value;
      currentSettings.temperature     = parseFloat(els.defaultTemp.value);
      currentSettings.autoSave        = els.autoSave.checked;

      // Security: ONLY use chrome.storage.local — keys never leave the device
      await chrome.storage.local.set({ settings: currentSettings });
      showStatus('Settings saved successfully!', 'success');
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
