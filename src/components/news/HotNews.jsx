import { memo } from 'react';
import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import { timeAgo, getSafeImageUrl, createArticleId } from '@/utils/formatters';
import { detectCategoryFromArticle } from '@/utils/categoryMapper';

const HotNews = memo(function HotNews({ article, categorySlug }) {
  if (!article) return null;

  const detected = categorySlug && categorySlug !== 'general' ? categorySlug : detectCategoryFromArticle(article);
  const articleId = createArticleId(article);

  // Store article for detail page
  const handleClick = () => {
    sessionStorage.setItem(`article_${articleId}`, JSON.stringify({ ...article, _category: detected }));
  };

  return (
    <Link
      to={`/article/${articleId}?category=${detected}`}
      onClick={handleClick}
      className="hot-news flex gap-[50px] text-justify bg-white mx-[50px] my-5 no-underline text-black article-fade-in"
    >
      <img
        src={getSafeImageUrl(article.urlToImage)}
        alt={article.title}
        className="w-[40vw] object-cover"
        loading="lazy"
        onError={(e) => { e.target.src = 'https://placehold.co/600x400/1a3fc7/white?text=Tukang+Kawal'; }}
      />
      <div className="pr-[30px] flex flex-col justify-center gap-5">
        <h2 className="text-[40px] tracking-[-2px] leading-[35px]">{article.title}</h2>
        <p className="pt-0 pr-[100px]">{article.description || ''}</p>
        <div className="flex gap-2.5 text-[13px] text-[#777]">
          <Badge category={detected} />
          <span>{timeAgo(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
});

export default HotNews;
