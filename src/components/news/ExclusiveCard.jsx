import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import { getSafeImageUrl } from '@/utils/formatters';

export default function ExclusiveCard({ article }) {
  const detected = article.categories?.slug || 'general';

  return (
    <article className="exclusive-card flex-1 bg-white rounded-[10px] overflow-hidden transition-transform duration-300 hover:-translate-y-[3px] article-fade-in">
      <Link to={`/article/${article.slug}?category=${detected}`} className="no-underline text-inherit">
        <img
          src={getSafeImageUrl(article.cover_image_url)}
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
