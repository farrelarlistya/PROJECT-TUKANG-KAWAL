import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import HotNews from '@/components/news/HotNews';
import NewsGrid from '@/components/news/NewsGrid';
import TrendingSection from '@/components/news/TrendingSection';
import ExclusiveSection from '@/components/news/ExclusiveSection';
import Ticker from '@/components/news/Ticker';
import { SkeletonGrid, SkeletonHotNews, SkeletonTrending } from '@/components/ui/Skeleton';
import { useNewsAPI, useLoadMoreArticles, useNewsSearch } from '@/hooks/useNewsAPI';

export default function Home() {
  const { slug } = useParams();
  const category = slug || 'general';

  const { articles, totalResults, isLoading, error } = useNewsAPI(category, 1, 20);
  const { extraArticles, loadMore, isLoading: loadingMore, hasMore, reset } = useLoadMoreArticles(category);
  const { articles: searchResults, isLoading: searching, search } = useNewsSearch();

  const [isSearching, setIsSearching] = useState(false);

  // Reset extra articles on category change
  useEffect(() => { reset(); }, [category, reset]);

  // Listen for search events from Header
  useEffect(() => {
    let timer;
    const handler = (e) => {
      const q = e.detail;
      clearTimeout(timer);
      if (!q || q.length < 3) {
        setIsSearching(false);
        return;
      }
      timer = setTimeout(() => {
        setIsSearching(true);
        search(q);
      }, 500);
    };
    window.addEventListener('search-query', handler);
    return () => {
      window.removeEventListener('search-query', handler);
      clearTimeout(timer);
    };
  }, [search]);

  // Derived data
  const hotArticle = useMemo(() => {
    if (isSearching && searchResults.length > 0) return searchResults[0];
    return articles.length > 0 ? articles[0] : null;
  }, [articles, searchResults, isSearching]);

  const cardArticles = useMemo(() => {
    if (isSearching) return searchResults.slice(1);
    return articles.slice(1, 7);
  }, [articles, searchResults, isSearching]);

  const trendingArticles = useMemo(() => {
    if (isSearching) return [];
    return articles.length > 7 ? articles.slice(7, 12) : articles.slice(0, 5);
  }, [articles, isSearching]);

  const allCardArticles = useMemo(() => {
    return [...cardArticles, ...extraArticles];
  }, [cardArticles, extraArticles]);

  const showLoadMore = !isSearching && hasMore && articles.length > 0;

  return (
    <PageWrapper showSearch={true} showCategories={true} activeCategory={category}>
      <Ticker articles={articles} />

      <main>
        {/* Hot News */}
        <div id="hot-news-container">
          {isLoading ? <SkeletonHotNews /> : <HotNews article={hotArticle} categorySlug={category} />}
        </div>

        {/* News Cards Grid */}
        <section className="px-[50px] mb-[30px]">
          <div className="flex items-center justify-between mb-[25px]">
            <h1 className="text-[28px] text-[#222]">
              {isSearching ? 'Hasil Pencarian' : 'Berita Terkini'}
            </h1>
          </div>

          <div id="news-cards-container" className="grid grid-cols-3 gap-[25px]">
            {isLoading || searching ? (
              <SkeletonGrid count={6} />
            ) : error ? (
              <div className="error-state text-center py-12 px-6 col-span-3">
                <div className="text-[48px] mb-4">⚠️</div>
                <h3 className="text-[20px] text-[#333] mb-2 font-semibold">Gagal Memuat Berita</h3>
                <p className="text-[14px] text-[#777] mb-5 max-w-[400px] mx-auto">{error}</p>
                <button onClick={() => window.location.reload()} className="bg-brand text-white py-2.5 px-6 rounded-lg border-none cursor-pointer text-[14px] font-semibold hover:bg-brand-hover transition-colors">
                  Coba Lagi
                </button>
              </div>
            ) : (
              <NewsGrid articles={allCardArticles} categorySlug={category} />
            )}
          </div>

          {/* Load More */}
          {showLoadMore && (
            <div className="text-center my-[35px]">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-white text-brand border-2 border-brand py-3 px-[35px] rounded-lg text-[15px] font-semibold cursor-pointer transition-all duration-300 hover:bg-brand hover:text-white disabled:opacity-50"
              >
                {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak Berita'}
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Exclusive Section */}
      {!isSearching && <ExclusiveSection />}

      {/* Trending Section */}
      {!isSearching && (
        <section className="py-10 px-[50px]">
          <h2 className="text-[26px] text-[#222] mb-5 pb-[15px] border-b-2 border-[#ddd]">Sedang Trending</h2>
          {isLoading ? (
            <ul className="list-none"><SkeletonTrending count={5} /></ul>
          ) : (
            <TrendingSection articles={trendingArticles} />
          )}
        </section>
      )}
    </PageWrapper>
  );
}
