// VibeContent Pro - Content Script
// Handles page extraction and communication with side panel

(function() {
  'use strict';

  // Prevent duplicate injection
  if (window.__shadowEngineInjected) return;
  window.__shadowEngineInjected = true;

  // Listen for extraction requests from background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageContent') {
      const data = extractContent();
      sendResponse(data);
      return true;
    }

    if (request.action === 'highlightText') {
      highlightText(request.text);
      sendResponse({ success: true });
      return true;
    }
  });

  function extractContent() {
    const getMeta = (name) => {
      const selectors = [
        `meta[name="${name}"]`,
        `meta[property="og:${name}"]`,
        `meta[property="twitter:${name}"]`,
        `meta[itemprop="${name}"]`
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return el.getAttribute('content');
      }
      return '';
    };

    // Smart content detection algorithm
    const findMainContent = () => {
      const candidates = [];
      const selectors = [
        'article', '[role="main"]', '.post-content', '.entry-content',
        '.article-content', '.content', 'main', '#content', '.post',
        '[itemprop="articleBody"]', '.story-body', '.article-body',
        '.news-item', '.blog-post', '.post-body'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const text = el.innerText || '';
          if (text.length > 300) {
            candidates.push({
              element: el,
              text: text,
              score: calculateContentScore(el, text)
            });
          }
        });
      }

      if (candidates.length === 0) {
        // Fallback: find largest text block
        const allElements = document.querySelectorAll('p, div, section');
        let bestElement = document.body;
        let maxText = 0;

        allElements.forEach(el => {
          const text = el.innerText || '';
          if (text.length > maxText && text.length > 500) {
            maxText = text.length;
            bestElement = el;
          }
        });

        return bestElement;
      }

      candidates.sort((a, b) => b.score - a.score);
      return candidates[0].element;
    };

    const calculateContentScore = (element, text) => {
      let score = text.length;

      // Prefer article tags
      if (element.tagName === 'ARTICLE') score *= 1.5;
      if (element.getAttribute('role') === 'main') score *= 1.4;

      // Penalize elements with many links (likely navigation)
      const linkRatio = element.querySelectorAll('a').length / (text.length / 100 + 1);
      score -= linkRatio * 50;

      // Penalize elements with many images (likely galleries)
      const imgRatio = element.querySelectorAll('img').length / (text.length / 500 + 1);
      score -= imgRatio * 30;

      // Prefer elements with paragraph density
      const pCount = element.querySelectorAll('p').length;
      if (pCount > 3) score *= 1.2;

      return score;
    };

    const mainContent = findMainContent();
    const clone = mainContent.cloneNode(true);

    // Remove noise
    const noiseSelectors = [
      'nav', 'header', 'footer', 'aside', '.sidebar', '.comments',
      '.advertisement', '.ad', 'script', 'style', 'noscript',
      '.social-share', '.related-posts', 'iframe', 'form',
      '.newsletter', '.subscribe', '.author-bio', '.tag-cloud',
      '.breadcrumb', '.pagination', '.share-buttons'
    ];

    noiseSelectors.forEach(sel => {
      clone.querySelectorAll(sel).forEach(el => el.remove());
    });

    // Clean text
    let cleanText = clone.innerText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    // Limit to reasonable size
    const maxChars = 12000;
    if (cleanText.length > maxChars) {
      // Try to cut at paragraph boundary
      const cutPoint = cleanText.lastIndexOf('\n', maxChars);
      cleanText = cleanText.substring(0, cutPoint > maxChars * 0.8 ? cutPoint : maxChars);
    }

    // Extract headings for structure
    const headings = [];
    mainContent.querySelectorAll('h1, h2, h3, h4').forEach(h => {
      if (h.innerText.trim().length > 5) {
        headings.push({
          level: parseInt(h.tagName[1]),
          text: h.innerText.trim()
        });
      }
    });

    return {
      title: document.title,
      url: window.location.href,
      description: getMeta('description') || getMeta('description'),
      author: getMeta('author') || getMeta('site_name') || getMeta('publisher'),
      publishDate: getMeta('published_time') || getMeta('pubdate') || getMeta('datePublished'),
      content: cleanText,
      headings: headings.slice(0, 10),
      wordCount: cleanText.split(/\s+/).filter(w => w.length > 0).length,
      domain: window.location.hostname,
      favicon: getMeta('image') || '',
      siteName: getMeta('site_name') || window.location.hostname
    };
  }

  function highlightText(text) {
    if (!text || text.length < 10) return;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.includes(text.substring(0, 30))) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(node => {
      const span = document.createElement('span');
      span.style.backgroundColor = '#ffeb3b';
      span.style.color = '#000';
      span.style.padding = '2px 0';

      const parent = node.parentNode;
      const nodeText = node.textContent;
      const index = nodeText.indexOf(text.substring(0, 30));

      if (index >= 0) {
        const before = document.createTextNode(nodeText.substring(0, index));
        const match = document.createTextNode(nodeText.substring(index, index + text.length));
        const after = document.createTextNode(nodeText.substring(index + text.length));

        const matchSpan = document.createElement('span');
        matchSpan.style.backgroundColor = '#ffeb3b';
        matchSpan.style.color = '#000';
        matchSpan.appendChild(match);

        parent.insertBefore(before, node);
        parent.insertBefore(matchSpan, node);
        parent.insertBefore(after, node);
        parent.removeChild(node);
      }
    });
  }

  // Auto-extract on load for side panel
  setTimeout(() => {
    const data = extractContent();
    chrome.runtime.sendMessage({
      action: 'pageContentReady',
      data: data
    }).catch(() => {});
  }, 1500);

})();
