/**
 * useNewsAPI.js — Custom hook untuk fetch berita dari NewsAPI
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTopHeadlines, searchNews } from '@/services/newsService';
import { getCategoryConfig } from '@/utils/categoryMapper';

/**
 * @param {string} category - Slug kategori
 * @param {number} page - Nomor halaman
 * @param {number} pageSize - Jumlah artikel per halaman
 * @returns {{ articles, totalResults, isLoading, error, refetch }}
 */
export function useNewsAPI(category = 'general', page = 1, pageSize = 20) {
  const [articles, setArticles] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const config = getCategoryConfig(category);
      let data = await fetchTopHeadlines(config.apiCategory, '', page, pageSize);

      // Fallback ke US jika Indonesia kosong
      if (data.articles.length === 0) {
        console.log('[useNewsAPI] ID kosong, fallback ke US...');
        data = await fetchTopHeadlines(config.apiCategory, '', page, pageSize, 'us');
      }

      setArticles(data.articles);
      setTotalResults(data.totalResults);
    } catch (err) {
      console.error('[useNewsAPI] Error:', err);
      setError(err.message);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [category, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { articles, totalResults, isLoading, error, refetch: fetchData };
}

/**
 * Hook untuk pencarian berita
 * @param {string} query - Keyword pencarian
 * @param {number} pageSize
 * @returns {{ articles, totalResults, isLoading, error, search }}
 */
export function useNewsSearch(pageSize = 12) {
  const [articles, setArticles] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query) => {
    if (!query || query.trim().length < 3) {
      setArticles([]);
      setTotalResults(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await searchNews(query, 1, pageSize);
      setArticles(data.articles);
      setTotalResults(data.totalResults);
    } catch (err) {
      setError(err.message);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  return { articles, totalResults, isLoading, error, search };
}

/**
 * Hook untuk load more articles (pagination offset)
 * 
 * IMPORTANT: pageSize harus membagi initialFetchSize secara rata
 * agar pagination API sejajar (tidak ada artikel yang terlewat/duplikat).
 * Default: initialFetchSize=20, pageSize=10 → startPage=2, first load = page 3
 * 
 * @param {string} category
 * @param {number} pageSize - Jumlah artikel per load (harus membagi initialFetchSize)
 * @param {number} initialFetchSize - pageSize dari fetch awal di useNewsAPI
 * @returns {{ extraArticles, loadMore, isLoading, hasMore, reset }}
 */
export function useLoadMoreArticles(category = 'general', pageSize = 10, initialFetchSize = 20) {
  // Hitung halaman awal agar tidak overlap dengan fetch awal
  // Initial fetch: page=1, pageSize=20 → articles 0-19
  // Load more pageSize=10: startPage = 20/10 = 2
  // First loadMore: nextPage = 3, offset = 2*10 = 20 → articles 20-29 ✓
  const startPage = Math.ceil(initialFetchSize / pageSize);

  const [extraArticles, setExtraArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(startPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // Gunakan ref untuk guard agar tidak ada race condition saat klik cepat
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);

    const nextPage = currentPage + 1;
    const config = getCategoryConfig(category);

    try {
      let data = await fetchTopHeadlines(config.apiCategory, '', nextPage, pageSize);

      // Fallback ke US jika Indonesia kosong
      if (data.articles.length === 0) {
        console.log('[useLoadMore] ID kosong, fallback ke US...');
        data = await fetchTopHeadlines(config.apiCategory, '', nextPage, pageSize, 'us');
      }

      if (data.articles.length === 0) {
        setHasMore(false);
      } else {
        setExtraArticles(prev => [...prev, ...data.articles]);
        setCurrentPage(nextPage);
        // Jika hasil kurang dari pageSize, berarti sudah habis
        if (data.articles.length < pageSize) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('[useLoadMore] Error:', err);
      // Sembunyikan tombol saat error agar tidak terus gagal
      setHasMore(false);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [category, currentPage, pageSize]);

  const reset = useCallback(() => {
    setExtraArticles([]);
    setCurrentPage(startPage);
    setHasMore(true);
    isLoadingRef.current = false;
  }, [startPage]);

  return { extraArticles, loadMore, isLoading, hasMore, reset };
}
