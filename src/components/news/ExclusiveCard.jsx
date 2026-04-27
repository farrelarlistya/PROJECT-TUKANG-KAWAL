import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import { getSafeImageUrl, createArticleId } from '@/utils/formatters';
import { detectCategoryFromArticle } from '@/utils/categoryMapper';

export default function ExclusiveCard({ article }) {
  const detected = detectCategoryFromArticle(article);
  const markedArticle = { ...article, _isExclusive: true };
  const articleId = createArticleId(article);

  const handleClick = () => {
    sessionStorage.setItem(`article_${articleId}`, JSON.stringify({ ...markedArticle, _category: detected }));
  };

  return (
    <article className="exclusive-card flex-1 bg-white rounded-[10px] overflow-hidden transition-transform duration-300 hover:-translate-y-[3px] article-fade-in">
      <Link to={`/article/${articleId}?category=${detected}`} onClick={handleClick} className="no-underline text-inherit">
        <img
          src={getSafeImageUrl(article.urlToImage)}
          alt={article.title}
          loading="lazy"
          onError={(e) => { e.target.src = 'https://placehold.co/400x200/1a3fc7/white?text=Eksklusif'; }}
        />
        <div className="exclusive-card-body p-[15px]">
          <Badge category={detected} className="mb-2" />
          <h3>{article.title}</h3>
          <p>{article.description || ''}</p>
        </div>
      </Link>
    </article>
  );
}
