import { memo } from 'react';
import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import { timeAgo, getSafeImageUrl } from '@/utils/formatters';

const HotNews = memo(function HotNews({ article, categorySlug }) {
  if (!article) return null;

  const detected = article.categories?.slug || categorySlug || 'general';

  return (
    <Link
      to={`/article/${article.slug}?category=${detected}`}
      className="hot-news flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-[50px] text-justify bg-white mx-4 sm:mx-6 lg:mx-[50px] my-5 no-underline text-black article-fade-in"
    >
      <div className="w-full md:w-[45%] shrink-0 overflow-hidden">
        <img
          src={getSafeImageUrl(article.cover_image_url)}
          alt={article.title}
          className="w-full aspect-[16/9] object-cover"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://placehold.co/600x400/1a3fc7/white?text=Tukang+Kawal'; }}
        />
      </div>
      <div className="px-4 md:px-0 md:pr-[30px] pb-4 md:pb-0 flex flex-col justify-center gap-3 md:gap-5">
        <h2 className="text-[24px] sm:text-[32px] md:text-[40px] tracking-[-1px] md:tracking-[-2px] leading-[1.1] md:leading-[35px]">{article.title}</h2>
        <p className="text-[14px] md:text-base">{article.description || ''}</p>
        <div className="flex gap-2.5 text-[13px] text-[#777]">
          <Badge category={detected} />
          <span>{timeAgo(article.published_at)}</span>
        </div>
      </div>
    </Link>
  );
});

export default HotNews;
