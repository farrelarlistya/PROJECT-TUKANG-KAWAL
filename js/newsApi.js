/**
 * newsApi.js — Modul layanan API untuk NewsAPI.org
 * Menangani semua komunikasi dengan NewsAPI termasuk caching & error handling
 */

const NEWS_CONFIG = {
    API_KEY: '711ffbd68874473285411075bb5de8f4',
    BASE_URL: 'https://newsapi.org/v2',
    DEFAULT_COUNTRY: 'id',       // Indonesia sesuai request user
    FALLBACK_COUNTRY: 'us',
    DEFAULT_PAGE_SIZE: 6,
    CACHE_DURATION_MS: 5 * 60 * 1000 // 5 menit cache
};

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
 * Strategi: gunakan country + category tanpa query keyword karena
 * kombinasi country + query sering menghasilkan 0 result di free tier.
 * Filtering berdasarkan keyword dilakukan client-side.
 * 
 * @param {string} category - Kategori NewsAPI (business, general, dll)
 * @param {string} query - TIDAK digunakan untuk API call, hanya untuk cache key
 * @param {number} page - Nomor halaman (default 1)
 * @param {number} pageSize - Jumlah artikel per halaman
 * @returns {Promise<{articles: Array, totalResults: number}>}
 */
async function fetchTopHeadlines(category = 'general', query = '', page = 1, pageSize = NEWS_CONFIG.DEFAULT_PAGE_SIZE, countryOverride = null) {
    const params = {
        apiKey: NEWS_CONFIG.API_KEY,
        country: countryOverride || NEWS_CONFIG.DEFAULT_COUNTRY,
        category: category,
        page: page,
        pageSize: pageSize
    };

    const cacheKey = buildCacheKey('top-headlines', { ...params, _q: query });

    // Cek cache dulu
    const cached = getFromCache(cacheKey);
    if (cached) {
        console.log('[NewsAPI] Cache hit:', category);
        return cached;
    }

    // Build URL tanpa query param — filter client-side
    const urlParams = new URLSearchParams(params);
    const url = `${NEWS_CONFIG.BASE_URL}/top-headlines?${urlParams.toString()}`;

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
                throw new Error('Fitur ini memerlukan paket berbayar NewsAPI. Menggunakan data yang tersedia.');
            }
            throw new Error(errorData.message || `Error ${response.status}: Gagal mengambil data berita.`);
        }

        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error(data.message || 'NewsAPI mengembalikan status error.');
        }

        const result = {
            articles: filterValidArticles(data.articles),
            totalResults: data.totalResults
        };

        // Simpan ke cache
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
 * @param {string} query - Keyword pencarian
 * @param {number} page - Nomor halaman
 * @param {number} pageSize - Jumlah artikel per halaman
 * @returns {Promise<{articles: Array, totalResults: number}>}
 */
async function searchNews(query, page = 1, pageSize = NEWS_CONFIG.DEFAULT_PAGE_SIZE) {
    if (!query || query.trim() === '') {
        return { articles: [], totalResults: 0 };
    }

    const params = {
        apiKey: NEWS_CONFIG.API_KEY,
        q: query.trim(),
        language: 'en',
        sortBy: 'publishedAt',
        page: page,
        pageSize: pageSize
    };

    const cacheKey = buildCacheKey('everything', params);

    const cached = getFromCache(cacheKey);
    if (cached) {
        console.log('[NewsAPI] Search cache hit:', query);
        return cached;
    }

    const urlParams = new URLSearchParams(params);
    const url = `${NEWS_CONFIG.BASE_URL}/everything?${urlParams.toString()}`;

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
            totalResults: data.totalResults
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
function clearCache() {
    apiCache.clear();
    console.log('[NewsAPI] Cache dibersihkan.');
}

// Expose ke global scope
window.NewsAPI = {
    fetchTopHeadlines,
    searchNews,
    clearCache,
    CONFIG: NEWS_CONFIG
};
