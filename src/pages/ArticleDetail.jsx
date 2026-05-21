import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import Badge from '@/components/ui/Badge';
import ExclusiveLockOverlay from '@/components/auth/ExclusiveLockOverlay';
import NewsCard from '@/components/news/NewsCard';
import { useAuth } from '@/context/AppContext';
import { getArticleBySlug, getPublishedArticles } from '@/services/articleService';
import { formatFullDate, getSafeImageUrl } from '@/utils/formatters';
import { getCategoryLabel } from '@/utils/categoryMapper';

export default function ArticleDetail() {
  const { id: slug } = useParams(); // URL param is actually the slug
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category') || 'general';
  const { isMember } = useAuth();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState({});

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      try {
        const data = await getArticleBySlug(slug);
        setArticle(data);
        if (data) document.title = `${data.title} | Tukang Kawal`;
      } catch (err) {
        console.error("Gagal memuat artikel:", err);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [slug]);

  // Load related articles
  useEffect(() => {
    async function loadRelated() {
      const cats = ['business', 'entertainment', 'health', 'technology']
        .filter(c => c !== categorySlug)
        .slice(0, 4);

      const results = {};
      await Promise.all(cats.map(async (catSlug) => {
        try {
          const data = await getPublishedArticles({ category: catSlug, page: 1, limit: 4 });
          results[catSlug] = data.articles || [];
        } catch {
          results[catSlug] = [];
        }
      }));
      setRelatedArticles(results);
    }
    if (article) loadRelated();
  }, [article, categorySlug]);

  if (loading) {
    return (
      <PageWrapper showCategories={true}>
        <main className="article-layout max-w-[800px] mx-auto my-10 px-6">
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            <p className="mt-4 text-[#777]">Memuat artikel...</p>
          </div>
        </main>
      </PageWrapper>
    );
  }

  if (!article) {
    return (
      <PageWrapper showCategories={true}>
        <main className="article-layout max-w-[800px] mx-auto my-10 px-6">
          <div className="error-state text-center py-20">
            <div className="text-[48px] mb-4"></div>
            <h3 className="text-[20px] text-[#333] mb-2">Artikel Tidak Ditemukan</h3>
            <p className="text-[14px] text-[#777] mb-5">Artikel yang Anda cari tidak tersedia atau sudah dihapus.</p>
            <Link to="/" className="bg-brand text-white py-2.5 px-6 rounded-lg no-underline text-[14px] font-semibold">
              Kembali ke Beranda
            </Link>
          </div>
        </main>
      </PageWrapper>
    );
  }

  const detected = article.categories?.slug || categorySlug || 'general';
  const authorInitials = article.profiles?.initials || 'TK';
  const authorName = article.profiles?.full_name || 'Redaksi TukangKawal';
  const isExclusive = article.is_exclusive === true;
  const showPaywall = isExclusive && !isMember;

  return (
    <PageWrapper showCategories={true}>
      <main className="article-layout max-w-[800px] mx-auto my-10 px-6 !bg-[#fcfcfc] font-dm-sans">
        <h1 className="article-detail-title font-playfair text-[42px] leading-[1.25] text-[#111] mb-4 tracking-[-0.5px]">
          {article.title}
        </h1>

        <div className="article-detail-meta flex items-center justify-between border-t border-b border-[#eaeaea] py-4 mb-[30px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-[14px] overflow-hidden">
              {article.profiles?.avatar_url ? (
                <img src={article.profiles.avatar_url} alt={authorName} className="w-full h-full object-cover" />
              ) : (
                authorInitials
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold text-[#222]">{authorName}</span>
              <span className="text-[13px] text-[#777]">{formatFullDate(article.published_at)}</span>
            </div>
          </div>
          <div className="flex gap-2.5 items-center">
            {isExclusive && (
              <span className="inline-block py-[3px] px-2.5 rounded-[4px] text-[11px] font-bold text-white uppercase bg-linear-to-r from-[#1e3a8a] to-[#3b82f6]">
                Eksklusif
              </span>
            )}
            <Badge category={detected} />
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); }}
              className="py-1.5 px-3 border border-[#dcdcdc] bg-white rounded-[6px] text-[13px] font-semibold text-[#555] cursor-pointer transition-all duration-200 hover:bg-[#f5f5f5] hover:text-brand hover:border-brand"
            >
              Salin Tautan
            </button>
          </div>
        </div>

        <figure className="article-hero mb-[35px]">
          <img
            src={getSafeImageUrl(article.cover_image_url)}
            alt={article.title}
            loading="lazy"
            onError={(e) => { e.target.src = 'https://placehold.co/800x400/1a3fc7/white?text=Tukang+Kawal'; }}
          />
          {article.cover_image_url && <figcaption>Dokumentasi TukangKawal</figcaption>}
        </figure>

        <div className={showPaywall ? 'paywall-wrapper' : ''}>
          <article className="article-content font-source-serif text-[18px] leading-[1.8] text-[#2c2c2c] whitespace-pre-wrap">
            {article.content}
          </article>
          {showPaywall && <ExclusiveLockOverlay />}
        </div>

        <div className="mt-10 pt-5 border-t border-[#eaeaea] flex items-center gap-2.5 flex-wrap">
          <span className="text-[14px] font-semibold text-[#555]">Topik Terkait:</span>
          <Link to={`/category/${detected}`} className="inline-block bg-[#f0f0f0] text-[#444] py-1.5 px-3 rounded-[20px] text-[13px] font-medium no-underline transition-colors duration-200 hover:bg-[#e0e0e0] hover:text-brand">
            {getCategoryLabel(detected)}
          </Link>
        </div>

        {/* Related Articles */}
        <div className="mt-10 pt-[30px] border-t border-[#eaeaea]">
          <h3 className="text-[20px] font-bold text-[#222] mb-5">Berita Terkait</h3>

          {Object.keys(relatedArticles).length === 0 ? (
            <div className="text-center py-10">
              <div className="inline-block w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
              <p className="mt-3 text-[14px] text-[#999]">Memuat berita terkait...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(relatedArticles).map(([catSlug, arts]) => {
                if (!arts || arts.length === 0) return null;
                return (
                  <div key={catSlug} className="article-fade-in">
                    <h4 className="font-dm-sans text-[15px] font-extrabold uppercase text-[#111] mb-4 pb-2 border-b border-[#eee]">
                      {getCategoryLabel(catSlug)}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {arts.slice(0, 2).map((a, i) => (
                        <NewsCard key={a.id || i} article={a} categorySlug={catSlug} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </PageWrapper>
  );
}
