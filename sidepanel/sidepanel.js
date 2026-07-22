// VibeContent Pro - Side Panel Controller
// Handles all UI interactions, generation, and vault management

document.addEventListener('DOMContentLoaded', async () => {

  // State
  let currentPageData = null;
  let generatedContent = '';
  // Selected custom prompt is managed via dropdown
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
    newsTopicSelect: document.getElementById('newsTopicSelect'),
    newsSearch: document.getElementById('newsSearch'),
    newsSearchInput: document.getElementById('newsSearchInput'),
    newsSearchBtn: document.getElementById('newsSearchBtn'),
    newsFeed: document.getElementById('newsFeed'),
    pageInfo: document.getElementById('pageInfo'),
    sourceStats: document.getElementById('sourceStats'),
    wordCount: document.getElementById('wordCount'),
    charCount: document.getElementById('charCount'),
    domainName: document.getElementById('domainName'),


    generateBtn: document.getElementById('generateBtn'),
    apiWarning: document.getElementById('apiWarning'),
    outputEmpty: document.getElementById('outputEmpty'),
    outputContent: document.getElementById('outputContent'),

    chatInput: document.getElementById('chatInput'),
    sendChatBtn: document.getElementById('sendChatBtn'),
    chatbotResponse: document.getElementById('chatbotResponse'),
    customPromptSelect: document.getElementById('customPromptSelect'),
    customPromptHint: document.getElementById('customPromptHint'),
    editPromptsLink: document.getElementById('editPromptsLink'),

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
  setupEventListeners();
  try {
    await loadSettings();
  } catch (error) {
    console.error('Settings load error:', error);
    showToast('Settings could not be loaded. Open Settings and save again.', 'error');
  }

  await updateVaultCount();

  // Try to auto-extract current page
  setTimeout(() => extractCurrentPage(), 500);

  // Functions
  function getActiveApiKey(s) {
    if (!s) return '';
    const provider = s.provider;
    const key = s.providersConfig?.[provider]?.key;
    if (key) return key;
    return s.apiKey || '';
  }

  async function loadSettings() {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        if (response && !response.error) {
          settings = response;
          populateCustomPrompts(response.customPrompts);
        }
        resolve();
      });
    });
  }

  function populateCustomPrompts(prompts = []) {
    els.customPromptSelect.innerHTML = '';
    if (prompts.length === 0) {
      els.customPromptSelect.innerHTML = '<option value="">No custom prompts found</option>';
      els.customPromptHint.textContent = 'Go to Settings to create one!';
      return;
    }
    
    prompts.forEach((p, index) => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.title;
      els.customPromptSelect.appendChild(option);
      if (index === 0) {
        els.customPromptHint.textContent = p.text.length > 50 ? p.text.substring(0, 50) + '...' : p.text;
      }
    });

    if (window.refreshCustomSelect) {
      window.refreshCustomSelect(els.customPromptSelect);
    }
  }

  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.settings) {
        loadSettings().catch(error => {
          console.error('Settings reload error:', error);
          showToast('Settings could not be reloaded.', 'error');
        });
      }
    });
  }

  function setupEventListeners() {
    els.sourceTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        els.sourceTabs.forEach(t => t.classList.remove('active'));
        els.sourcePanels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.source + 'Source').classList.add('active');

        if (tab.dataset.source === 'news' && !els.newsFeed.hasChildNodes() || els.newsFeed.querySelector('.news-loading')?.textContent.includes('Click')) {
          loadTrendingNews(els.newsTopicSelect.value);
        }
      });
    });

    els.newsTopicSelect.addEventListener('change', () => {
      const topic = els.newsTopicSelect.value;
      if (topic === 'TRENDING_SEARCHES') {
        els.newsSearch.classList.remove('hidden');
      } else {
        els.newsSearch.classList.add('hidden');
      }
      loadTrendingNews(topic);
    });

    els.newsSearchBtn.addEventListener('click', () => {
      const query = els.newsSearchInput.value.trim();
      if (query) {
        loadTrendingNews('SEARCH', query);
      }
    });

    els.newsSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = els.newsSearchInput.value.trim();
        if (query) {
          loadTrendingNews('SEARCH', query);
        }
      }
    });


    els.editPromptsLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });

    els.sendChatBtn.addEventListener('click', handleChat);
    els.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleChat();
    });

    els.customPromptSelect.addEventListener('change', () => {
      const prompts = settings.customPrompts || [];
      const selected = prompts.find(x => x.id === els.customPromptSelect.value);
      if (selected) {
        els.customPromptHint.textContent = selected.text.length > 50 ? selected.text.substring(0, 50) + '...' : selected.text;
      }
    });

    els.extractBtn.addEventListener('click', extractCurrentPage);
    els.fetchUrlBtn.addEventListener('click', fetchUrlContent);
    els.usePasteBtn.addEventListener('click', () => {
      const text = els.pasteInput.value.trim();
      if (!text) return;
      currentPageData = {
        title: 'Pasted Content',
        content: text,
        url: '',
        domain: 'manual',
        description: '',
        headings: []
      };
      updateSourceDisplay();
      showToast('Content loaded from paste');
    });

    // Dynamic webpage updates
    chrome.tabs.onActivated.addListener(() => {
      if (document.getElementById('currentSource').classList.contains('active')) {
        extractCurrentPage(true);
      }
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.active) {
        if (document.getElementById('currentSource').classList.contains('active')) {
          extractCurrentPage(true);
        }
      }
    });

    els.generateBtn.addEventListener('click', generateContent);
    
    els.copyBtn.addEventListener('click', () => {
      const text = els.generatedText.textContent;
      navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
      });
    });

    els.saveBtn.addEventListener('click', saveCurrentContent);
    els.regenerateBtn.addEventListener('click', generateContent);

    els.vaultBtn.addEventListener('click', openVault);
    els.closeVault.addEventListener('click', () => els.vaultModal.classList.add('hidden'));
    els.vaultModal.querySelector('.modal-overlay').addEventListener('click', () => {
      els.vaultModal.classList.add('hidden');
    });

    els.settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  async function handleChat() {
    const query = els.chatInput.value.trim();
    if (!query) return;

    if (!currentPageData) {
      showToast('Please extract page content first!', 'error');
      return;
    }

    els.chatbotResponse.classList.remove('hidden');
    els.chatbotResponse.innerHTML = '<span class="spinner" style="width:12px;height:12px;display:inline-block;border-width:2px;margin-right:8px;vertical-align:middle;"></span> Thinking...';
    els.chatbotResponse.style.color = 'var(--text)';
    els.chatInput.value = '';
    
    const mascot = document.querySelector('.scientist-svg');
    if (mascot) {
      mascot.style.transform = 'scale(1.05)';
      setTimeout(() => mascot.style.transform = 'scale(1)', 200);
    }

    const config = {
      isChatBot: true,
      query: query
    };

    const systemPrompt = PromptEngine.buildSystemPrompt(config);
    const userPrompt = PromptEngine.buildUserPrompt(currentPageData, config);

    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'generateContent',
          data: { systemPrompt, userPrompt }
        }, (res) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (res && res.error) {
            reject(new Error(res.error));
          } else {
            resolve(res);
          }
        });
      });
      
      els.chatbotResponse.innerHTML = response.content.replace(/\n/g, '<br>');
    } catch (err) {
      els.chatbotResponse.textContent = 'Error: ' + err.message;
      els.chatbotResponse.style.color = 'var(--danger)';
    }
  }

  async function extractCurrentPage(silent = false) {
    try {
      els.extractBtn.disabled = true;
      els.extractBtn.innerHTML = '<span class="spinner"></span> Extracting...';

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        if (silent !== true) showToast('No active tab found', 'error');
        return;
      }

      if (!/^https?:\/\//i.test(tab.url || '')) {
        if (silent !== true) showToast('Open a regular webpage first, then extract content.', 'error');
        return;
      }

      let response = null;
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            return typeof window.__vibeExtractContent === 'function' ? window.__vibeExtractContent() : null;
          }
        });
        response = results[0]?.result;
      } catch (e) {
        console.warn('Content script execution warning:', e);
      }

      if (response && response.content) {
        if (!currentPageData || currentPageData.url !== response.url) {
          resetUIState();
        }
        currentPageData = response;
        updateSourceDisplay();
        if (silent !== true) showToast(`Extracted ${response.wordCount} words from ${response.domain}`);
      } else {
        if (silent !== true) showToast('Could not extract content from this page', 'error');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      if (silent !== true) showToast('Extraction failed. Try refreshing the page.', 'error');
    } finally {
      els.extractBtn.disabled = false;
      els.extractBtn.textContent = `Extract Page Content`;
    }
  }

  function resetUIState() {
    // 1. Reset Chatbot
    els.chatbotResponse.innerHTML = '';
    els.chatbotResponse.classList.add('hidden');
    els.chatInput.value = '';

    // 2. Reset Content Output
    els.outputContent.classList.add('hidden');
    els.outputEmpty.classList.remove('hidden');
    els.generatedText.textContent = '';
    els.outputWordCount.textContent = '0 words';
    els.outputCharCount.textContent = '0 chars';
    generatedContent = '';
    updateHumanScore(0);

    // 3. Reset Custom Prompt
    if (els.customPromptSelect.options.length > 0) {
      els.customPromptSelect.selectedIndex = 0;
    }
    if (window.refreshCustomSelect) {
      window.refreshCustomSelect(els.customPromptSelect);
    }
  }

  function waitForTabLoad(tabId, timeoutMs = 10000) {
    return new Promise(resolve => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      };
      const listener = (updatedTabId, changeInfo) => {
        if (updatedTabId === tabId && changeInfo.status === 'complete') {
          finish();
        }
      };
      const timer = setTimeout(finish, timeoutMs);
      chrome.tabs.onUpdated.addListener(listener);
      chrome.tabs.get(tabId, tab => {
        if (chrome.runtime.lastError || tab?.status === 'complete') {
          finish();
        }
      });
    });
  }

  async function fetchUrlContent() {
    const url = els.urlInput.value.trim();
    if (!url) {
      showToast('Please enter a URL', 'error');
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      showToast('Please enter a full http or https URL', 'error');
      return;
    }

    let tab = null;
    try {
      els.fetchUrlBtn.disabled = true;
      els.fetchUrlBtn.textContent = 'Fetching...';

      tab = await chrome.tabs.create({ url, active: false });
      await waitForTabLoad(tab.id);

      let response = null;
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            return typeof window.__vibeExtractContent === 'function' ? window.__vibeExtractContent() : null;
          }
        });
        response = results[0]?.result;
      } catch (e) {
        console.warn('Background fetch execution warning:', e);
      }

      if (response && response.content) {
        currentPageData = response;
        updateSourceDisplay();
        showToast(`Fetched ${response.wordCount} words from ${response.domain}`);
      } else {
        showToast('Could not fetch content. The site may block extraction.', 'error');
      }

    } catch (error) {
      showToast('Failed to fetch URL: ' + error.message, 'error');
    } finally {
      if (tab?.id) {
        try {
          await chrome.tabs.remove(tab.id);
        } catch (error) {
          console.warn('Could not close temporary tab:', error);
        }
      }
      els.fetchUrlBtn.disabled = false;
      els.fetchUrlBtn.textContent = `Fetch & Analyze`;
    }
  }

  // ─── News Feed Logic ────────────────────────────────────────────────────────
  async function loadTrendingNews(topic = 'TOP_STORIES', query = '') {
    els.newsFeed.innerHTML = '<div class="news-loading">Loading headlines...</div>';

    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'fetchTrendingNews',
          params: { topic, query }
        }, (res) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (res && res.error) {
            reject(new Error(res.error));
          } else {
            resolve(res);
          }
        });
      });

      const articles = response.articles || [];
      renderNewsFeed(articles);
    } catch (error) {
      console.error('Failed to load news:', error);
      els.newsFeed.innerHTML = `<div class="news-error">Failed to load news: ${error.message}</div>`;
    }
  }

  function renderNewsFeed(articles = []) {
    if (!articles || articles.length === 0) {
      els.newsFeed.innerHTML = '<div class="news-empty">No articles found. Try another topic or search query.</div>';
      return;
    }

    els.newsFeed.innerHTML = '';
    articles.forEach(article => {
      const card = document.createElement('div');
      card.className = 'news-card';
      
      const header = document.createElement('div');
      header.className = 'news-card-header';

      const sourceBadge = document.createElement('span');
      sourceBadge.className = article.isTrending ? 'trending-badge' : 'news-card-source';
      sourceBadge.textContent = article.isTrending ? `🔥 ${article.source}` : article.source;

      const timeSpan = document.createElement('span');
      timeSpan.className = 'news-card-time';
      timeSpan.textContent = article.pubDate || '';

      header.appendChild(sourceBadge);
      header.appendChild(timeSpan);

      const titleEl = document.createElement('div');
      titleEl.className = 'news-card-title';
      titleEl.textContent = article.title;

      card.appendChild(header);
      card.appendChild(titleEl);

      if (article.description) {
        const descEl = document.createElement('div');
        descEl.className = 'news-card-desc';
        descEl.textContent = article.description;
        card.appendChild(descEl);
      }

      card.addEventListener('click', () => handleArticleClick(article));
      els.newsFeed.appendChild(card);
    });
  }

  async function handleArticleClick(article) {
    if (!article.link) {
      showToast('No valid link for this article', 'error');
      return;
    }

    showToast(`Extracting article: ${article.title.substring(0, 30)}...`);

    // Use URL input and existing fetchUrlContent flow logic
    els.urlInput.value = article.link;
    
    // Switch to URL source tab
    const urlTab = Array.from(els.sourceTabs).find(t => t.dataset.source === 'url');
    if (urlTab) urlTab.click();

    // Trigger URL fetch
    await fetchUrlContent();

    // If successfully extracted, switch to Current Page view to see stats/summary
    if (currentPageData && currentPageData.content) {
      const currentTab = Array.from(els.sourceTabs).find(t => t.dataset.source === 'current');
      if (currentTab) currentTab.click();
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

    try {
      els.generateBtn.disabled = true;
      els.generateBtn.querySelector('.btn-text').classList.add('hidden');
      els.generateBtn.querySelector('.btn-loader').classList.remove('hidden');
      els.outputEmpty.classList.add('hidden');
      els.outputContent.classList.remove('hidden');
      els.generatedText.textContent = 'Generating viral content...';

      const selectedPromptId = els.customPromptSelect.value;
      const prompts = settings.customPrompts || [];
      const selectedPrompt = prompts.find(x => x.id === selectedPromptId);

      const config = {
        isChatBot: false,
        agent: 'custom_prompt',
        customPromptText: selectedPrompt ? selectedPrompt.text : "Summarize this page."
      };

      const systemPrompt = PromptEngine.buildSystemPrompt(config);
      const userPrompt = PromptEngine.buildUserPrompt(currentPageData, config);

      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'generateContent',
          data: { systemPrompt, userPrompt }
        }, (res) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (res && res.error) {
            reject(new Error(res.error));
          } else {
            resolve(res);
          }
        });
      });
      const content = response.content;

      generatedContent = content;

      const originalText = content;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      let iterations = 0;
      
      const decodeInterval = setInterval(() => {
        els.generatedText.textContent = originalText.split('').map((char, index) => {
          if (char === ' ' || char === '\n') return char;
          if (index < iterations) return originalText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        
        iterations += Math.max(1, Math.floor(originalText.length / 15));
        
        if (iterations >= originalText.length) {
          clearInterval(decodeInterval);
          els.generatedText.textContent = originalText;
        }
      }, 30);



      const words = content.split(/\s+/).filter(w => w.length > 0).length;
      els.outputWordCount.textContent = `${words} words`;
      els.outputCharCount.textContent = `${content.length} chars`;

      const score = PromptEngine.estimateHumanScore(content);
      updateHumanScore(score);

      if (settings.autoSave === true) {
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

    try {
      await chrome.runtime.sendMessage({
        action: 'saveToVault',
        data: {
          title,
          content: generatedContent,
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
    try {
      const vault = await chrome.runtime.sendMessage({ action: 'getVault' });
      const count = Array.isArray(vault) ? vault.length : 0;
      els.vaultCount.textContent = count;
      els.vaultCount.style.display = count > 0 ? 'flex' : 'none';
    } catch (error) {
      console.error('Vault count error:', error);
      els.vaultCount.textContent = '0';
      els.vaultCount.style.display = 'none';
    }
  }

  async function openVault() {
    let vault = [];
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getVault' });
      vault = Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Vault load error:', error);
      showToast('Could not load vault', 'error');
    }

    if (vault.length === 0) {
      els.vaultList.innerHTML = '<div class="vault-empty">No saved content yet. Generate and save your first piece!</div>';
    } else {
      els.vaultList.innerHTML = vault.map(item => `
        <div class="vault-item" data-id="${item.id}">
          <div class="vault-item-topbar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
            <div class="vault-item-meta" style="margin:0;">
              <span>${new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="vault-item-actions">
              <button class="vault-item-btn copy-vault text-btn-small" data-id="${item.id}" title="Copy">Copy</button>
              <button class="vault-item-btn delete delete-vault text-btn-small" data-id="${item.id}" title="Delete">Delete</button>
            </div>
          </div>
          <div class="vault-item-source" style="margin-bottom: 10px; font-size: 0.75rem;">
            ${item.sourceUrl 
              ? `<a href="${item.sourceUrl}" target="_blank" style="display:inline-flex; align-items:center; background:rgba(255,255,255,0.06); padding:4px 10px; border-radius:14px; color:#3B82F6; text-decoration:none; max-width:100%; box-sizing:border-box; border:1px solid rgba(255,255,255,0.1); transition:all 0.2s ease;" onmouseover="this.style.background='rgba(255,255,255,0.12)'; this.style.borderColor='#10B981'; this.style.color='#10B981';" onmouseout="this.style.background='rgba(255,255,255,0.06)'; this.style.borderColor='rgba(255,255,255,0.1)'; this.style.color='#3B82F6';">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px; flex-shrink:0; opacity:0.7;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                   <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(item.sourceUrl)}</span>
                 </a>` 
              : `<span style="display:inline-flex; align-items:center; background:rgba(255,255,255,0.04); padding:4px 10px; border-radius:14px; color:var(--text-muted);"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px; flex-shrink:0;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>Manual Input</span>`}
          </div>
          <div class="vault-item-preview" style="font-size: 0.85rem; color: var(--text-primary);">${escapeHtml(item.content.substring(0, 100))}...</div>
        </div>
      `).join('');

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
