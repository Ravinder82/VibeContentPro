// VibeContent Pro - News Feed Module
// Standalone module for fetching and parsing RSS feeds (Google News & Google Trends)

const newsCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch Google News RSS/Atom feed based on topic or search query.
 * @param {Object} options - { topic, query, hl, gl, ceid }
 * @returns {Promise<Array>} Array of parsed article objects
 */
export async function fetchGoogleNews(options = {}) {
  const {
    topic = 'TOP_STORIES',
    query = '',
    hl = 'en-US',
    gl = 'US',
    ceid = 'US:en'
  } = options;

  const cacheKey = `news_${topic}_${query}_${hl}_${gl}`;
  const cached = newsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  let rssUrl = '';
  if (query.trim()) {
    const encodedQuery = encodeURIComponent(query.trim());
    rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
  } else {
    const topicMap = {
      TOP_STORIES: '',
      TECHNOLOGY: '/headlines/section/topic/TECHNOLOGY',
      BUSINESS: '/headlines/section/topic/BUSINESS'
    };
    const topicPath = topicMap[topic] !== undefined ? topicMap[topic] : '';
    rssUrl = `https://news.google.com/rss${topicPath}?hl=${hl}&gl=${gl}&ceid=${ceid}`;
  }

  const response = await fetch(rssUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google News (Status ${response.status})`);
  }

  const xmlText = await response.text();
  const articles = parseRssXml(xmlText);

  newsCache.set(cacheKey, {
    timestamp: Date.now(),
    data: articles
  });

  return articles;
}

/**
 * Fetch Google Trends daily trending searches RSS.
 * @param {Object} options - { geo }
 * @returns {Promise<Array>} Array of parsed trending objects
 */
export async function fetchGoogleTrends(options = {}) {
  const { geo = 'US' } = options;

  const cacheKey = `trends_${geo}`;
  const cached = newsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const rssUrl = `https://trends.google.com/trending/rss?geo=${geo}`;

  const response = await fetch(rssUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google Trends (Status ${response.status})`);
  }

  const xmlText = await response.text();
  const trends = parseTrendsXml(xmlText);

  newsCache.set(cacheKey, {
    timestamp: Date.now(),
    data: trends
  });

  return trends;
}

/**
 * Parse RSS / Atom XML into structured article objects.
 * Works in both DOMParser context and regex fallback if DOMParser unavailable in worker context.
 */
function parseRssXml(xmlText) {
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const items = doc.querySelectorAll('item');
    
    if (items.length > 0) {
      return Array.from(items).map(item => {
        const title = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const descriptionRaw = item.querySelector('description')?.textContent || '';
        const source = item.querySelector('source')?.textContent || 'Google News';

        // Clean up description HTML
        let description = '';
        if (descriptionRaw) {
          const descDoc = parser.parseFromString(descriptionRaw, 'text/html');
          description = descDoc.body.textContent || '';
        }

        return {
          title: cleanTitle(title),
          link,
          pubDate: formatPubDate(pubDate),
          source,
          description,
          type: 'news'
        };
      });
    }

    // Atom fallback if feed uses entry tags
    const entries = doc.querySelectorAll('entry');
    return Array.from(entries).map(entry => {
      const title = entry.querySelector('title')?.textContent || '';
      const link = entry.querySelector('link')?.getAttribute('href') || entry.querySelector('link')?.textContent || '';
      const pubDate = entry.querySelector('published, updated')?.textContent || '';
      const source = entry.querySelector('source title')?.textContent || 'Google News';
      const summary = entry.querySelector('summary, content')?.textContent || '';

      return {
        title: cleanTitle(title),
        link,
        pubDate: formatPubDate(pubDate),
        source,
        description: summary.replace(/<[^>]*>/g, '').trim(),
        type: 'news'
      };
    });
  }

  return regexParseRss(xmlText);
}

/**
 * Parse Google Trends RSS XML.
 */
function parseTrendsXml(xmlText) {
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const items = doc.querySelectorAll('item');

    return Array.from(items).map(item => {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      const traffic = item.querySelector('approx_traffic, ht\\:approx_traffic')?.textContent || '';

      const newsItems = item.querySelectorAll('news_item, ht\\:news_item');
      let firstNewsTitle = '';
      let firstNewsUrl = '';
      let firstNewsSource = '';

      if (newsItems.length > 0) {
        const first = newsItems[0];
        firstNewsTitle = first.querySelector('news_item_title, ht\\:news_item_title')?.textContent || '';
        firstNewsUrl = first.querySelector('news_item_url, ht\\:news_item_url')?.textContent || '';
        firstNewsSource = first.querySelector('news_item_source, ht\\:news_item_source')?.textContent || '';
      }

      return {
        title: title,
        link: firstNewsUrl || link,
        pubDate: formatPubDate(pubDate),
        source: firstNewsSource || 'Google Trends',
        description: firstNewsTitle ? `Featured article: ${firstNewsTitle}` : `Search volume: ${traffic}`,
        traffic,
        isTrending: true,
        type: 'trend'
      };
    });
  }

  return [];
}

function cleanTitle(title) {
  if (!title) return '';
  // Google News titles often append " - Source Name" at the end
  const parts = title.split(' - ');
  if (parts.length > 1) {
    parts.pop(); // Remove source name
    return parts.join(' - ');
  }
  return title;
}

function formatPubDate(pubDateStr) {
  if (!pubDateStr) return '';
  try {
    const date = new Date(pubDateStr);
    if (isNaN(date.getTime())) return pubDateStr;

    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch (e) {
    return pubDateStr;
  }
}

function regexParseRss(xmlText) {
  const items = [];
  const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const itemXml of itemMatches) {
    const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const sourceMatch = itemXml.match(/<source[\s\S]*?>([\s\S]*?)<\/source>/i);

    const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
    const link = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';
    const source = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : 'Google News';

    if (title) {
      items.push({
        title: cleanTitle(title),
        link,
        pubDate: formatPubDate(pubDate),
        source,
        description: '',
        type: 'news'
      });
    }
  }

  return items;
}
