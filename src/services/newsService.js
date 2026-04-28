/**
 * newsService.js — Fetch wrapper untuk NewsAPI.org
 */
import { NEWS_CONFIG } from '@/utils/constants';

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = '/api/news/v2';

/** Cache sederhana berbasis Map */
const apiCache = new Map();

function buildCacheKey(endpoint, params) {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  return `${endpoint}?${sorted}`;
}

function getFromCache(key) {
  if (!apiCache.has(key)) return null;
  const cached = apiCache.get(key);
  if (Date.now() - cached.timestamp > NEWS_CONFIG.CACHE_DURATION_MS) {
    apiCache.delete(key);
    return null;
  }
  return cached.data;
}

function saveToCache(key, data) {
  apiCache.set(key, { data, timestamp: Date.now() });
}

/** Filter artikel valid (buang [Removed] dan tanpa title) */
function filterValidArticles(articles) {
  if (!Array.isArray(articles)) return [];
  return articles.filter(article => {
    if (!article.title || article.title === '[Removed]') return false;
    if (!article.description || article.description === '[Removed]') return false;
    return true;
  });
}

/**
 * Fetch top headlines dari NewsAPI
 * @param {string} category
 * @param {string} query - Untuk cache key saja
 * @param {number} page
 * @param {number} pageSize
 * @param {string|null} countryOverride
 * @returns {Promise<{articles: Array, totalResults: number}>}
 */
export async function fetchTopHeadlines(
  category = 'general',
  query = '',
  page = 1,
  pageSize = NEWS_CONFIG.DEFAULT_PAGE_SIZE,
  countryOverride = null
) {
  const params = {
    apiKey: API_KEY,
    country: countryOverride || NEWS_CONFIG.DEFAULT_COUNTRY,
    category,
    page,
    pageSize,
  };

  const cacheKey = buildCacheKey('top-headlines', { ...params, _q: query });
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log('[NewsAPI] Cache hit:', category);
    return cached;
  }

  const urlParams = new URLSearchParams(params);
  const url = `${BASE_URL}/top-headlines?${urlParams.toString()}`;

  try {
    console.log('[NewsAPI] Fetching:', category, '(page:', page, ')');
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('API Key tidak valid. Silakan periksa konfigurasi API key Anda.');
      }
      if (response.status === 429) {
        throw new Error('Batas request harian tercapai. Coba lagi besok.');
      }
      if (response.status === 426) {
        throw new Error('Fitur ini memerlukan paket berbayar NewsAPI.');
      }
      throw new Error(errorData.message || `Error ${response.status}: Gagal mengambil data berita.`);
    }

    const data = await response.json();
    if (data.status !== 'ok') {
      throw new Error(data.message || 'NewsAPI mengembalikan status error.');
    }

    const result = {
      articles: filterValidArticles(data.articles),
      totalResults: data.totalResults,
    };

    saveToCache(cacheKey, result);
    return result;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Gagal terhubung ke server. Periksa koneksi internet Anda.');
    }
    throw error;
  }
}

/**
 * Fetch berita via /everything endpoint (untuk pencarian)
 * @param {string} query
 * @param {number} page
 * @param {number} pageSize
 * @returns {Promise<{articles: Array, totalResults: number}>}
 */
export async function searchNews(query, page = 1, pageSize = NEWS_CONFIG.DEFAULT_PAGE_SIZE) {
  if (!query || query.trim() === '') {
    return { articles: [], totalResults: 0 };
  }

  const params = {
    apiKey: API_KEY,
    q: query.trim(),
    language: 'en',
    sortBy: 'publishedAt',
    page,
    pageSize,
  };

  const cacheKey = buildCacheKey('everything', params);
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log('[NewsAPI] Search cache hit:', query);
    return cached;
  }

  const urlParams = new URLSearchParams(params);
  const url = `${BASE_URL}/everything?${urlParams.toString()}`;

  try {
    console.log('[NewsAPI] Searching:', query);
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: Gagal mencari berita.`);
    }

    const data = await response.json();
    if (data.status !== 'ok') {
      throw new Error(data.message || 'Pencarian gagal.');
    }

    const result = {
      articles: filterValidArticles(data.articles),
      totalResults: data.totalResults,
    };

    saveToCache(cacheKey, result);
    return result;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Gagal terhubung ke server. Periksa koneksi internet Anda.');
    }
    throw error;
  }
}

/** Bersihkan semua cache */
export function clearCache() {
  apiCache.clear();
  console.log('[NewsAPI] Cache dibersihkan.');
}
