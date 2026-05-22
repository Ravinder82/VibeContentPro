// VibeContent Pro - Settings Page Controller

document.addEventListener('DOMContentLoaded', async () => {

  // DOM Elements
  const els = {
    providerSelect: document.getElementById('providerSelect'),
    modelSelect: document.getElementById('modelSelect'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    toggleKeyVisibility: document.getElementById('toggleKeyVisibility'),
    apiKeyHint: document.getElementById('apiKeyHint'),
    testConnectionBtn: document.getElementById('testConnectionBtn'),
    connectionStatusIndicator: document.getElementById('connectionStatusIndicator'),
    connectionStatusText: document.getElementById('connectionStatusText'),
    defaultPersona: document.getElementById('defaultPersona'),
    defaultPlatform: document.getElementById('defaultPlatform'),
    defaultMode: document.getElementById('defaultMode'),
    defaultTemp: document.getElementById('defaultTemp'),
    defaultTempValue: document.getElementById('defaultTempValue'),
    autoSave: document.getElementById('autoSave'),
    clearVaultBtn: document.getElementById('clearVaultBtn'),
    resetSettingsBtn: document.getElementById('resetSettingsBtn'),
    saveBtn: document.getElementById('saveBtn'),
    saveStatus: document.getElementById('saveStatus')
  };

  const MODELS = {
    openai: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Default)' },
      { id: 'gpt-4o', name: 'GPT-4o' }
    ],
    anthropic: [
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
      { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet' }
    ],
    gemini: [
      { id: 'gemini-flash-latest', name: 'Gemini 1.5 Flash (Latest)' },
      { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro' },
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Exp' }
    ],
    openrouter: [
      { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B Instruct (Free)' },
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash Exp (Free)' },
      { id: 'deepseek/deepseek-chat:free', name: 'DeepSeek Chat (Free)' },
      { id: 'moonshotai/moonshot-v1-8k:free', name: 'Kimi / Moonshot (Free)' },
      { id: 'zhipuai/glm-4-flash', name: 'GLM-4 Flash (Free)' },
      { id: 'mistralai/mistral-nemo:free', name: 'Mistral Nemo (Free)' },
      { id: 'microsoft/phi-3-mini-128k-instruct:free', name: 'Phi-3 Mini (Free)' },
      { id: 'qwen/qwen-2-7b-instruct:free', name: 'Qwen 2 7B (Free)' },
      { id: 'openchat/openchat-7b:free', name: 'OpenChat 7B (Free)' },
      { id: 'cognitivecomputations/dolphin-mixtral-8x7b:free', name: 'Dolphin Mixtral (Free)' },
      { id: 'huggingfaceh4/zephyr-7b-beta:free', name: 'Zephyr 7B Beta (Free)' }
    ],
    nvidia: [
      { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
      { id: 'meta/llama-3.1-405b-instruct', name: 'Llama 3.1 405B' },
      { id: 'mistralai/mistral-large-2-instruct', name: 'Mistral Large 2' },
      { id: 'nvidia/nemotron-4-340b-instruct', name: 'Nemotron-4 340B' },
      { id: 'google/gemma-2-27b-it', name: 'Gemma 2 27B' },
      { id: 'qwen/qwen2-72b-instruct', name: 'Qwen 2 72B' },
      { id: 'snowflake/arctic', name: 'Snowflake Arctic' },
      { id: 'databricks/dbrx-instruct', name: 'DBRX Instruct' },
      { id: 'microsoft/phi-3-medium-4k-instruct', name: 'Phi-3 Medium' }
    ]
  };

  const HINTS = {
    openai: '<a href="https://platform.openai.com/api-keys" target="_blank">Get OpenAI key</a>',
    anthropic: '<a href="https://console.anthropic.com/settings/keys" target="_blank">Get Anthropic key</a>',
    gemini: '<a href="https://aistudio.google.com/app/apikey" target="_blank">Get Gemini key</a>',
    openrouter: '<a href="https://openrouter.ai/keys" target="_blank">Get OpenRouter key</a>',
    nvidia: '<a href="https://build.nvidia.com/" target="_blank">Get NVIDIA NIM key (Free Trial)</a>'
  };

  function updateModelDropdown(provider, selectedModel = null) {
    const models = MODELS[provider] || [];
    els.modelSelect.innerHTML = models.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    els.apiKeyHint.innerHTML = HINTS[provider] || '';
    
    if (selectedModel && models.find(m => m.id === selectedModel)) {
      els.modelSelect.value = selectedModel;
    }
  }

  els.providerSelect.addEventListener('change', (e) => {
    updateModelDropdown(e.target.value);
  });

  // Load current settings
  await loadSettings();

  // Event Listeners
  els.toggleKeyVisibility.addEventListener('click', () => {
    const isPassword = els.apiKeyInput.type === 'password';
    els.apiKeyInput.type = isPassword ? 'text' : 'password';
    els.toggleKeyVisibility.textContent = isPassword ? 'Hide' : 'Show';
  });

  els.defaultTemp.addEventListener('input', (e) => {
    els.defaultTempValue.textContent = e.target.value;
  });

  els.saveBtn.addEventListener('click', saveSettings);

  els.testConnectionBtn.addEventListener('click', async () => {
    const provider = els.providerSelect.value;
    const model = els.modelSelect.value;
    const apiKey = els.apiKeyInput.value.trim();

    if (!apiKey) {
      els.connectionStatusIndicator.style.backgroundColor = 'var(--danger)';
      els.connectionStatusText.textContent = 'Please enter an API key first';
      els.connectionStatusText.style.color = 'var(--danger)';
      return;
    }

    els.testConnectionBtn.disabled = true;
    els.testConnectionBtn.textContent = 'Testing...';
    els.connectionStatusIndicator.style.backgroundColor = '#f1c40f'; // yellow/loading
    els.connectionStatusText.textContent = 'Connecting...';
    els.connectionStatusText.style.color = 'var(--text-light)';

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'testApiConnection',
        data: { provider, model, apiKey }
      });

      if (response.success) {
        els.connectionStatusIndicator.style.backgroundColor = 'var(--success)';
        els.connectionStatusText.textContent = 'Connected successfully!';
        els.connectionStatusText.style.color = 'var(--success)';
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      els.connectionStatusIndicator.style.backgroundColor = 'var(--danger)';
      els.connectionStatusText.textContent = 'Failed: ' + error.message;
      els.connectionStatusText.style.color = 'var(--danger)';
    } finally {
      els.testConnectionBtn.disabled = false;
      els.testConnectionBtn.textContent = 'Test Connection';
    }
  });

  els.clearVaultBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete ALL saved content? This cannot be undone.')) {
      await chrome.storage.local.set({ vault: [] });
      showStatus('Vault cleared successfully', 'success');
    }
  });

  els.resetSettingsBtn.addEventListener('click', async () => {
    if (confirm('Reset all settings to defaults?')) {
      const defaults = {
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

      await chrome.storage.local.set({ settings: defaults });
      await loadSettings();
      showStatus('Settings reset to defaults', 'success');
    }
  });

  // Functions
  async function loadSettings() {
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || {};

    els.providerSelect.value = settings.provider || 'openai';
    updateModelDropdown(els.providerSelect.value, settings.model);
    els.apiKeyInput.value = settings.apiKey || '';
    els.defaultPersona.value = settings.defaultPersona || 'storyteller';
    els.defaultPlatform.value = settings.defaultPlatform || 'linkedin';
    els.defaultMode.value = settings.defaultMode || 'rephrase';
    els.defaultTemp.value = settings.temperature || 0.85;
    els.defaultTempValue.textContent = settings.temperature || 0.85;
    els.autoSave.checked = settings.autoSave !== false;
  }

  async function saveSettings() {
    try {
      const settings = {
        provider: els.providerSelect.value,
        model: els.modelSelect.value,
        apiKey: els.apiKeyInput.value.trim(),
        defaultPersona: els.defaultPersona.value,
        defaultPlatform: els.defaultPlatform.value,
        defaultMode: els.defaultMode.value,
        temperature: parseFloat(els.defaultTemp.value),
        autoSave: els.autoSave.checked,
        language: 'en'
      };

      await chrome.storage.local.set({ settings });
      showStatus('Settings saved successfully!', 'success');
    } catch (error) {
      showStatus('Failed to save settings: ' + error.message, 'error');
    }
  }

  function showStatus(message, type) {
    els.saveStatus.textContent = message;
    els.saveStatus.className = 'save-status show ' + type;

    setTimeout(() => {
      els.saveStatus.classList.remove('show');
    }, 3000);
  }

});
