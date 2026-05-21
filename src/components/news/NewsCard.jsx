import { memo } from 'react';
import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import { timeAgo, getSafeImageUrl } from '@/utils/formatters';

const NewsCard = memo(function NewsCard({ article, categorySlug }) {
  // Try to use article's category slug, then fallback to prop, then 'general'
  const detected = article.categories?.slug || categorySlug || 'general';
  const authorName = article.profiles?.full_name || 'Redaksi TukangKawal';

  return (
    <Link
      to={`/article/${article.slug}?category=${detected}`}
      className="news-card block bg-white rounded-lg overflow-hidden transition-all duration-300 no-underline text-inherit cursor-pointer hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:-translate-y-[3px] article-fade-in"
    >
      <img
        src={getSafeImageUrl(article.cover_image_url)}
        alt={article.title}
        loading="lazy"
        onError={(e) => { e.target.src = 'https://placehold.co/400x200/1a3fc7/white?text=Tukang+Kawal'; }}
      />
      <div className="news-card-body p-[15px]">
        <Badge category={detected} className="mb-2" />
        <h3>{article.title}</h3>
        <p>{article.description || ''}</p>
        <div className="flex gap-2.5 text-[12px] text-[#999]">
          <span>{timeAgo(article.published_at)}</span>
          <span>• {authorName}</span>
        </div>
      </div>
    </Link>
  );
});

export default NewsCard;
