import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import Badge from '@/components/ui/Badge';
import ExclusiveLockOverlay from '@/components/auth/ExclusiveLockOverlay';
import NewsCard from '@/components/news/NewsCard';
import { useAuth } from '@/context/AppContext';
import { fetchTopHeadlines } from '@/services/newsService';
import { formatFullDate, getAuthorInitials, getSafeImageUrl, getArticlePreview } from '@/utils/formatters';
import { detectCategoryFromArticle, getCategoryConfig, getCategoryLabel } from '@/utils/categoryMapper';

export default function ArticleDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category') || 'semua';
  const { isMember } = useAuth();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState({});

  useEffect(() => {
    // Load article from sessionStorage
    const stored = sessionStorage.getItem(`article_${id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      setArticle(parsed);
      document.title = `${parsed.title} | Tukang Kawal`;
    }
    setLoading(false);
  }, [id]);

  // Load related articles
  useEffect(() => {
    async function loadRelated() {
      const cats = ['business', 'entertainment', 'health', 'technology']
        .filter(c => c !== categorySlug)
        .slice(0, 4);

      const results = {};
      await Promise.all(cats.map(async (slug) => {
        const config = getCategoryConfig(slug);
        try {
          const data = await fetchTopHeadlines(config.apiCategory, '', 1, 2);
          results[slug] = data.articles;
        } catch {
          results[slug] = [];
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
            <div className="text-[48px] mb-4">📰</div>
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

  const detected = categorySlug || detectCategoryFromArticle(article);
  const authorInitials = getAuthorInitials(article.author);
  const authorName = article.author || 'Redaksi TukangKawal';
  const isExclusive = article._isExclusive === true;
  const showPaywall = isExclusive && !isMember;

  // Build content
  let contentParagraphs = [];
  if (article.description) {
    contentParagraphs.push(`**TukangKawal** — ${article.description}`);
  }
  if (article.content && article.content !== '[Removed]') {
    const cleanContent = article.content.replace(/\[\+\d+ chars\]$/, '').trim();
    contentParagraphs.push(cleanContent);
  }

  return (
    <PageWrapper showCategories={true}>
      <main className="article-layout max-w-[800px] mx-auto my-10 px-6 !bg-[#fcfcfc] font-dm-sans">
        <h1 className="article-detail-title font-playfair text-[42px] leading-[1.25] text-[#111] mb-4 tracking-[-0.5px]">
          {article.title}
        </h1>

        <div className="article-detail-meta flex items-center justify-between border-t border-b border-[#eaeaea] py-4 mb-[30px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-[14px]">
              {authorInitials}
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold text-[#222]">{authorName}</span>
              <span className="text-[13px] text-[#777]">{formatFullDate(article.publishedAt)}</span>
            </div>
          </div>
          <div className="flex gap-2.5 items-center">
            {isExclusive && (
              <span className="inline-block py-[3px] px-2.5 rounded-[4px] text-[11px] font-bold text-white uppercase bg-linear-to-r from-[#1e3a8a] to-[#3b82f6]">
                🔒 Eksklusif
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
            src={getSafeImageUrl(article.urlToImage)}
            alt={article.title}
            loading="lazy"
            onError={(e) => { e.target.src = 'https://placehold.co/800x400/1a3fc7/white?text=Tukang+Kawal'; }}
          />
          <figcaption>Dokumentasi TukangKawal</figcaption>
        </figure>

        <div className={showPaywall ? 'paywall-wrapper' : ''}>
          <article className="article-content font-source-serif text-[18px] leading-[1.8] text-[#2c2c2c]">
            {contentParagraphs.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ))}
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
          <div className="article-detail-grid grid grid-cols-4 gap-5">
            {Object.entries(relatedArticles).map(([slug, arts]) => {
              if (!arts || arts.length === 0) return null;
              const a = arts[0];
              return (
                <div key={slug} className="flex flex-col article-fade-in">
                  <h4 className="font-dm-sans text-[15px] font-extrabold uppercase text-[#111] mb-4 pb-2">
                    {getCategoryLabel(slug)}
                  </h4>
                  <NewsCard article={a} categorySlug={slug} />
                </div>
              );
            })}
            {Object.keys(relatedArticles).length === 0 && (
              <div className="col-span-4 text-center text-[#999] py-5">Memuat berita terkait...</div>
            )}
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
