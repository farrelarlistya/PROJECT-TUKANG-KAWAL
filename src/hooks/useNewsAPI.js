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
 * @param {string} category
 * @param {number} pageSize
 * @returns {{ articles, loadMore, isLoading, hasMore, reset }}
 */
export function useLoadMoreArticles(category = 'general', pageSize = 6) {
  const [extraArticles, setExtraArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    const nextPage = currentPage + 1;
    const config = getCategoryConfig(category);

    try {
      const data = await fetchTopHeadlines(config.apiCategory, '', nextPage, pageSize + 2);
      const validArticles = data.articles.slice(0, pageSize);

      if (validArticles.length === 0) {
        setHasMore(false);
      } else {
        setExtraArticles(prev => [...prev, ...validArticles]);
        setCurrentPage(nextPage);
      }
    } catch (err) {
      console.error('[useLoadMore] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [category, currentPage, isLoading, pageSize]);

  const reset = useCallback(() => {
    setExtraArticles([]);
    setCurrentPage(1);
    setHasMore(true);
  }, []);

  return { extraArticles, loadMore, isLoading, hasMore, reset };
}
