import { memo } from 'react';
import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import { timeAgo, getSafeImageUrl, createArticleId } from '@/utils/formatters';
import { detectCategoryFromArticle } from '@/utils/categoryMapper';

const NewsCard = memo(function NewsCard({ article, categorySlug }) {
  const detected = categorySlug && categorySlug !== 'general'
    ? categorySlug
    : detectCategoryFromArticle(article);
  const articleId = createArticleId(article);

  const handleClick = () => {
    sessionStorage.setItem(`article_${articleId}`, JSON.stringify({ ...article, _category: detected }));
  };

  return (
    <Link
      to={`/article/${articleId}?category=${detected}`}
      onClick={handleClick}
      className="news-card block bg-white rounded-lg overflow-hidden transition-all duration-300 no-underline text-inherit cursor-pointer hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:-translate-y-[3px] article-fade-in"
    >
      <img
        src={getSafeImageUrl(article.urlToImage)}
        alt={article.title}
        loading="lazy"
        onError={(e) => { e.target.src = 'https://placehold.co/400x200/1a3fc7/white?text=Tukang+Kawal'; }}
      />
      <div className="news-card-body p-[15px]">
        <Badge category={detected} className="mb-2" />
        <h3>{article.title}</h3>
        <p>{article.description || ''}</p>
        <div className="flex gap-2.5 text-[12px] text-[#999]">
          <span>{timeAgo(article.publishedAt)}</span>
          {article.source?.name && <span>• {article.source.name}</span>}
        </div>
      </div>
    </Link>
  );
});

export default NewsCard;
