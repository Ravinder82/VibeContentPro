// VibeContent Pro - Side Panel Controller
// Handles all UI interactions, generation, and vault management

document.addEventListener('DOMContentLoaded', async () => {

  // State
  let currentPageData = null;
  let generatedContent = '';
  let settings = {};

  // DOM Elements
  const els = {
    settingsBtn: document.getElementById('settingsBtn'),
    vaultBtn: document.getElementById('vaultBtn'),
    vaultCount: document.getElementById('vaultCount'),
    sourceTabs: document.querySelectorAll('.source-tab'),
    sourcePanels: document.querySelectorAll('.source-panel'),
    extractBtn: document.getElementById('extractBtn'),
    urlInput: document.getElementById('urlInput'),
    fetchUrlBtn: document.getElementById('fetchUrlBtn'),
    pasteInput: document.getElementById('pasteInput'),
    usePasteBtn: document.getElementById('usePasteBtn'),
    pageInfo: document.getElementById('pageInfo'),
    sourceStats: document.getElementById('sourceStats'),
    wordCount: document.getElementById('wordCount'),
    charCount: document.getElementById('charCount'),
    domainName: document.getElementById('domainName'),
    personaSelect: document.getElementById('personaSelect'),
    platformSelect: document.getElementById('platformSelect'),
    modeSelect: document.getElementById('modeSelect'),
    advancedToggle: document.getElementById('advancedToggle'),
    advancedPanel: document.getElementById('advancedPanel'),
    customInstructions: document.getElementById('customInstructions'),
    tempSlider: document.getElementById('tempSlider'),
    tempValue: document.getElementById('tempValue'),
    batchSelect: document.getElementById('batchSelect'),
    generateBtn: document.getElementById('generateBtn'),
    apiWarning: document.getElementById('apiWarning'),
    outputEmpty: document.getElementById('outputEmpty'),
    outputContent: document.getElementById('outputContent'),
    outputPersona: document.getElementById('outputPersona'),
    outputPlatform: document.getElementById('outputPlatform'),
    outputMode: document.getElementById('outputMode'),
    copyBtn: document.getElementById('copyBtn'),
    saveBtn: document.getElementById('saveBtn'),
    regenerateBtn: document.getElementById('regenerateBtn'),
    scoreFill: document.getElementById('scoreFill'),
    scoreValue: document.getElementById('scoreValue'),
    generatedText: document.getElementById('generatedText'),
    outputWordCount: document.getElementById('outputWordCount'),
    outputCharCount: document.getElementById('outputCharCount'),
    vaultModal: document.getElementById('vaultModal'),
    closeVault: document.getElementById('closeVault'),
    vaultList: document.getElementById('vaultList'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
  };

  // Initialize
  await loadSettings();
  await updateVaultCount();
  setupEventListeners();

  // Try to auto-extract current page
  setTimeout(() => extractCurrentPage(), 500);

  // Functions
  function getActiveApiKey(s) {
    if (!s) return '';
    // New multi-provider format
    const provider = s.provider;
    const key = s.providersConfig?.[provider]?.key;
    if (key) return key;
    // Legacy single-key format (back-compat)
    return s.apiKey || '';
  }

  async function loadSettings() {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    settings = response || {};

    // Apply settings to UI
    if (settings.defaultPersona) els.personaSelect.value = settings.defaultPersona;
    if (settings.defaultPlatform) els.platformSelect.value = settings.defaultPlatform;
    if (settings.defaultMode) els.modeSelect.value = settings.defaultMode;
    if (settings.temperature) {
      els.tempSlider.value = settings.temperature;
      els.tempValue.textContent = settings.temperature;
    }

    // Check API key from the active provider (new format) with legacy fallback
    const activeKey = getActiveApiKey(settings);
    if (activeKey) {
      els.apiWarning.classList.add('hidden');
    } else {
      els.apiWarning.classList.remove('hidden');
    }
  }

  // Re-check settings whenever they change in another tab (options page)
  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.settings) {
        loadSettings();
      }
    });
  }

  function setupEventListeners() {
    // Source tabs
    els.sourceTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        els.sourceTabs.forEach(t => t.classList.remove('active'));
        els.sourcePanels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.source + 'Source').classList.add('active');
      });
    });

    // Extract current page
    els.extractBtn.addEventListener('click', extractCurrentPage);

    // Fetch URL
    els.fetchUrlBtn.addEventListener('click', fetchUrlContent);

    // Use paste
    els.usePasteBtn.addEventListener('click', () => {
      const text = els.pasteInput.value.trim();
      if (!text) {
        showToast('Please paste some content first', 'error');
        return;
      }
      currentPageData = {
        title: 'Pasted Content',
        url: 'manual-input',
        content: text,
        wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
        domain: 'manual',
        description: '',
        headings: []
      };
      updateSourceDisplay();
      showToast('Content loaded from paste');
    });

    // Advanced toggle
    els.advancedToggle.addEventListener('click', () => {
      els.advancedPanel.classList.toggle('hidden');
      const isHidden = els.advancedPanel.classList.contains('hidden');
      els.advancedToggle.textContent = isHidden ? '[ + ] Advanced Options' : '[ - ] Hide Advanced Options';
    });

    // Temperature slider
    els.tempSlider.addEventListener('input', (e) => {
      els.tempValue.textContent = e.target.value;
    });

    // Generate
    els.generateBtn.addEventListener('click', generateContent);

    // Copy
    els.copyBtn.addEventListener('click', () => {
      const text = els.generatedText.textContent;
      navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
      });
    });

    // Save
    els.saveBtn.addEventListener('click', saveCurrentContent);

    // Regenerate
    els.regenerateBtn.addEventListener('click', generateContent);

    // Vault
    els.vaultBtn.addEventListener('click', openVault);
    els.closeVault.addEventListener('click', () => els.vaultModal.classList.add('hidden'));
    els.vaultModal.querySelector('.modal-overlay').addEventListener('click', () => {
      els.vaultModal.classList.add('hidden');
    });

    // Settings
    els.settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  async function extractCurrentPage() {
    try {
      els.extractBtn.disabled = true;
      els.extractBtn.innerHTML = '<span class="spinner"></span> Extracting...';

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        showToast('No active tab found', 'error');
        return;
      }

      // Inject content script if needed
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch (e) {
        // Already injected or failed
      }

      // Get content
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' });

      if (response && response.content) {
        currentPageData = response;
        updateSourceDisplay();
        showToast(`Extracted ${response.wordCount} words from ${response.domain}`);
      } else {
        showToast('Could not extract content from this page', 'error');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      showToast('Extraction failed. Try refreshing the page.', 'error');
    } finally {
      els.extractBtn.disabled = false;
      els.extractBtn.textContent = `Extract Page Content`;
    }
  }

  async function fetchUrlContent() {
    const url = els.urlInput.value.trim();
    if (!url) {
      showToast('Please enter a URL', 'error');
      return;
    }

    try {
      els.fetchUrlBtn.disabled = true;
      els.fetchUrlBtn.textContent = 'Fetching...';

      // Try to open in new tab and extract
      const tab = await chrome.tabs.create({ url, active: false });

      // Wait for load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Inject and extract
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch (e) {}

      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' });

      if (response && response.content) {
        currentPageData = response;
        updateSourceDisplay();
        showToast(`Fetched ${response.wordCount} words from ${response.domain}`);
      } else {
        showToast('Could not fetch content. The site may block extraction.', 'error');
      }

      // Close the tab
      chrome.tabs.remove(tab.id);
    } catch (error) {
      showToast('Failed to fetch URL: ' + error.message, 'error');
    } finally {
      els.fetchUrlBtn.disabled = false;
      els.fetchUrlBtn.textContent = `Fetch & Analyze`;
    }
  }

  function updateSourceDisplay() {
    if (!currentPageData) return;

    const { title, url, description, content, wordCount, domain } = currentPageData;

    els.pageInfo.innerHTML = `
      <div class="page-data">
        <div class="page-title">${escapeHtml(title)}</div>
        <div class="page-url">${escapeHtml(url)}</div>
        ${description ? `<div class="page-desc">${escapeHtml(description)}</div>` : ''}
      </div>
    `;

    els.sourceStats.classList.remove('hidden');
    els.wordCount.textContent = `${wordCount} words`;
    els.charCount.textContent = `${content.length} chars`;
    els.domainName.textContent = domain;

    els.generateBtn.disabled = false;
  }

  async function generateContent() {
    if (!currentPageData) {
      showToast('Please extract or enter content first', 'error');
      return;
    }

    if (!getActiveApiKey(settings)) {
      els.apiWarning.classList.remove('hidden');
      showToast('Please configure API key in Settings', 'error');
      return;
    }

    const persona = els.personaSelect.value;
    const platform = els.platformSelect.value;
    const mode = els.modeSelect.value;
    const custom = els.customInstructions.value.trim();
    const batchCount = parseInt(els.batchSelect.value);

    try {
      // UI loading state
      els.generateBtn.disabled = true;
      els.generateBtn.querySelector('.btn-text').classList.add('hidden');
      els.generateBtn.querySelector('.btn-loader').classList.remove('hidden');
      els.outputEmpty.classList.add('hidden');
      els.outputContent.classList.remove('hidden');
      els.generatedText.textContent = 'Generating viral content...';

      let content = '';

      if (batchCount > 1) {
        // Batch generation
        const batchPrompt = PromptEngine.buildBatchPrompt(currentPageData, mode, platform, batchCount);
        const response = await chrome.runtime.sendMessage({
          action: 'generateContent',
          data: {
            systemPrompt: PromptEngine.buildSystemPrompt(persona, platform, mode),
            userPrompt: batchPrompt
          }
        });

        if (response.error) throw new Error(response.error);
        content = response.content;
      } else {
        // Single generation
        const systemPrompt = PromptEngine.buildSystemPrompt(persona, platform, mode);
        const userPrompt = PromptEngine.buildUserPrompt(currentPageData, mode, platform, custom);

        const response = await chrome.runtime.sendMessage({
          action: 'generateContent',
          data: { systemPrompt, userPrompt }
        });

        if (response.error) throw new Error(response.error);
        content = response.content;
      }

      generatedContent = content;

      // Display with Hacker Decode Animation
      const originalText = content;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      let iterations = 0;
      
      const decodeInterval = setInterval(() => {
        els.generatedText.textContent = originalText.split('').map((char, index) => {
          if (char === ' ' || char === '\n') return char;
          if (index < iterations) return originalText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        
        // Advance iterations faster for longer texts so it doesn't take forever
        iterations += Math.max(1, Math.floor(originalText.length / 15));
        
        if (iterations >= originalText.length) {
          clearInterval(decodeInterval);
          els.generatedText.textContent = originalText;
        }
      }, 30);
      els.outputPersona.textContent = PromptEngine.personas[persona]?.name || persona;
      els.outputPlatform.textContent = PromptEngine.platforms[platform]?.name || platform;
      els.outputMode.textContent = PromptEngine.modes[mode]?.name || mode;

      // Update counts
      const words = content.split(/\s+/).filter(w => w.length > 0).length;
      els.outputWordCount.textContent = `${words} words`;
      els.outputCharCount.textContent = `${content.length} chars`;

      // Calculate human score
      const score = PromptEngine.estimateHumanScore(content);
      updateHumanScore(score);

      // Auto-save if enabled
      if (settings.autoSave) {
        await saveCurrentContent();
      }

      showToast('Content generated successfully!', 'success');

    } catch (error) {
      console.error('Generation error:', error);
      els.generatedText.textContent = `Error: ${error.message}`;
      showToast(error.message, 'error');
    } finally {
      els.generateBtn.disabled = false;
      els.generateBtn.querySelector('.btn-text').classList.remove('hidden');
      els.generateBtn.querySelector('.btn-loader').classList.add('hidden');
    }
  }

  function updateHumanScore(score) {
    els.scoreValue.textContent = `${score}%`;
    els.scoreFill.style.width = `${score}%`;

    els.scoreFill.classList.remove('high', 'medium', 'low');
    if (score >= 70) {
      els.scoreFill.classList.add('high');
      els.scoreValue.style.color = 'var(--success)';
    } else if (score >= 40) {
      els.scoreFill.classList.add('medium');
      els.scoreValue.style.color = 'var(--warning)';
    } else {
      els.scoreFill.classList.add('low');
      els.scoreValue.style.color = 'var(--danger)';
    }
  }

  async function saveCurrentContent() {
    if (!generatedContent) return;

    const title = currentPageData?.title || 'Untitled';
    const persona = els.personaSelect.value;
    const platform = els.platformSelect.value;
    const mode = els.modeSelect.value;

    try {
      await chrome.runtime.sendMessage({
        action: 'saveToVault',
        data: {
          title,
          content: generatedContent,
          persona,
          platform,
          mode,
          sourceUrl: currentPageData?.url || '',
          sourceTitle: currentPageData?.title || ''
        }
      });

      await updateVaultCount();
      showToast('Saved to vault!', 'success');
    } catch (error) {
      showToast('Failed to save', 'error');
    }
  }

  async function updateVaultCount() {
    const vault = await chrome.runtime.sendMessage({ action: 'getVault' });
    els.vaultCount.textContent = vault.length;
    els.vaultCount.style.display = vault.length > 0 ? 'flex' : 'none';
  }

  async function openVault() {
    const vault = await chrome.runtime.sendMessage({ action: 'getVault' });

    if (vault.length === 0) {
      els.vaultList.innerHTML = '<div class="vault-empty">No saved content yet. Generate and save your first piece!</div>';
    } else {
      els.vaultList.innerHTML = vault.map(item => `
        <div class="vault-item" data-id="${item.id}">
          <div class="vault-item-header">
            <div class="vault-item-title">${escapeHtml(item.title || 'Untitled')}</div>
            <div class="vault-item-actions">
              <button class="vault-item-btn copy-vault text-btn-small" data-id="${item.id}" title="Copy">Copy</button>
              <button class="vault-item-btn load-vault text-btn-small" data-id="${item.id}" title="Load">Load</button>
              <button class="vault-item-btn delete delete-vault text-btn-small" data-id="${item.id}" title="Delete">Delete</button>
            </div>
          </div>
          <div class="vault-item-meta">
            <span>${PromptEngine.personas[item.persona]?.name || item.persona}</span>
            <span>${PromptEngine.platforms[item.platform]?.name || item.platform}</span>
            <span>${new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="vault-item-preview">${escapeHtml(item.content.substring(0, 120))}...</div>
        </div>
      `).join('');

      // Add event listeners to vault items
      els.vaultList.querySelectorAll('.copy-vault').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const item = vault.find(v => v.id === btn.dataset.id);
          if (item) {
            navigator.clipboard.writeText(item.content);
            showToast('Copied to clipboard!', 'success');
          }
        });
      });

      els.vaultList.querySelectorAll('.load-vault').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const item = vault.find(v => v.id === btn.dataset.id);
          if (item) {
            generatedContent = item.content;
            els.generatedText.textContent = item.content;
            els.outputPersona.textContent = PromptEngine.personas[item.persona]?.name || item.persona;
            els.outputPlatform.textContent = PromptEngine.platforms[item.platform]?.name || item.platform;
            els.outputMode.textContent = PromptEngine.modes[item.mode]?.name || item.mode;

            const words = item.content.split(/\s+/).filter(w => w.length > 0).length;
            els.outputWordCount.textContent = `${words} words`;
            els.outputCharCount.textContent = `${item.content.length} chars`;

            const score = PromptEngine.estimateHumanScore(item.content);
            updateHumanScore(score);

            els.outputEmpty.classList.add('hidden');
            els.outputContent.classList.remove('hidden');
            els.vaultModal.classList.add('hidden');

            showToast('Loaded from vault');
          }
        });
      });

      els.vaultList.querySelectorAll('.delete-vault').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await chrome.runtime.sendMessage({ action: 'deleteFromVault', id: btn.dataset.id });
          await updateVaultCount();
          openVault(); // Refresh
          showToast('Deleted from vault');
        });
      });
    }

    els.vaultModal.classList.remove('hidden');
  }

  function showToast(message, type = 'info') {
    els.toastMessage.textContent = message;
    els.toast.classList.remove('hidden', 'success');
    if (type === 'success') els.toast.classList.add('success');

    setTimeout(() => {
      els.toast.classList.add('hidden');
    }, 3000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

});
