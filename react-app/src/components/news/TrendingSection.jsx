import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import { getSafeImageUrl, createArticleId } from '@/utils/formatters';
import { detectCategoryFromArticle } from '@/utils/categoryMapper';

export default function TrendingSection({ articles }) {
  if (!articles || articles.length === 0) {
    return <p className="text-[#999] text-center py-5">Tidak ada berita trending saat ini.</p>;
  }

  return (
    <ul className="list-none">
      {articles.slice(0, 5).map((article, index) => {
        const detected = detectCategoryFromArticle(article);
        const articleId = createArticleId(article);

        const handleClick = () => {
          sessionStorage.setItem(`article_${articleId}`, JSON.stringify({ ...article, _category: detected }));
        };

        return (
          <li key={article.url || index} className="flex items-center gap-5 py-[15px] border-b border-[#eee] transition-colors duration-200 hover:bg-[#f5f5f5] article-fade-in">
            <img
              src={getSafeImageUrl(article.urlToImage)}
              alt=""
              className="w-20 h-20 rounded-lg object-cover shrink-0"
              loading="lazy"
              onError={(e) => { e.target.src = 'https://placehold.co/80x80/1a3fc7/white?text=TK'; }}
            />
            <span className="text-[28px] font-extrabold text-[#ccc] min-w-[40px] text-center">{index + 1}</span>
            <div className="trending-content flex-1">
              <Badge category={detected} className="mb-2" />
              <h3>
                <Link
                  to={`/article/${articleId}?category=${detected}`}
                  onClick={handleClick}
                  className="no-underline text-[#222] hover:text-brand"
                >
                  {article.title}
                </Link>
              </h3>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
