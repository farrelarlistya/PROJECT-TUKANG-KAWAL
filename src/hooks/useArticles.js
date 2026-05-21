import { useState, useEffect, useCallback, useRef } from 'react';
import { getPublishedArticles, searchArticles } from '@/services/articleService';

/**
 * Hook to fetch articles (replacing useNewsAPI)
 */
export function useArticles(category = 'general', page = 1, pageSize = 20) {
  const [articles, setArticles] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In Supabase, if category is 'general', we might want to pass null or just 'general'
      // and let the service handle it (it currently ignores 'general' in articleService)
      const data = await getPublishedArticles({ category, page, limit: pageSize });
      
      setArticles(data.articles);
      setTotalResults(data.totalResults);
    } catch (err) {
      console.error('[useArticles] Error:', err);
      setError(err.message || 'Gagal mengambil berita.');
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
 * Hook for searching articles
 */
export function useArticleSearch(pageSize = 12) {
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
      const data = await searchArticles(query, { page: 1, limit: pageSize });
      setArticles(data.articles);
      setTotalResults(data.totalResults);
    } catch (err) {
      console.error('[useArticleSearch] Error:', err);
      setError(err.message || 'Gagal mencari berita.');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  return { articles, totalResults, isLoading, error, search };
}

/**
 * Hook for pagination/load more
 */
export function useLoadMoreArticles(category = 'general', pageSize = 10, initialFetchSize = 20) {
  const startPage = Math.ceil(initialFetchSize / pageSize);

  const [extraArticles, setExtraArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(startPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);

    const nextPage = currentPage + 1;

    try {
      const data = await getPublishedArticles({ category, page: nextPage, limit: pageSize });
      
      if (data.articles.length === 0) {
        setHasMore(false);
      } else {
        setExtraArticles(prev => [...prev, ...data.articles]);
        setCurrentPage(nextPage);
        
        if (data.articles.length < pageSize) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('[useLoadMoreArticles] Error:', err);
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
