import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AppContext';
import ExclusiveCard from './ExclusiveCard';
import { fetchTopHeadlines } from '@/services/newsService';

export default function ExclusiveSection() {
  const { isMember } = useAuth();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTopHeadlines('general', '', 1, 6);
        setArticles(data.articles);
      } catch {
        setArticles([]);
      }
    }
    load();
  }, []);

  return (
    <section className="bg-brand p-[50px] flex gap-[30px] items-stretch">
      <div className="flex-[2]">
        <h2 className="text-white text-[26px] mb-5">Pengawal Eksklusif</h2>
        <div className="flex gap-5">
          {articles.slice(0, 2).map((article, i) => (
            <ExclusiveCard key={article.url || i} article={article} />
          ))}
        </div>
      </div>

      {isMember ? (
        <div id="exclusive-extra-container" className="flex-1 flex gap-5">
          {articles.slice(2, 4).map((article, i) => (
            <ExclusiveCard key={article.url || i} article={article} />
          ))}
        </div>
      ) : (
        <div className="flex-1 bg-brand-dark rounded-[10px] flex flex-col items-center justify-center text-center py-10 px-[30px]">
          <h3 className="text-white text-[22px] mb-3">Gabung Pengawal Eksklusif</h3>
          <p className="text-white/75 text-[14px] mb-5 leading-[1.5]">
            Dapatkan akses ke berita eksklusif, investigasi mendalam, dan analisis tajam langsung dari tim redaksi.
          </p>
          <Link
            to="/subscription"
            className="no-underline bg-white text-brand py-3 px-[30px] rounded-lg text-[15px] font-bold border-none cursor-pointer transition-all duration-300 hover:bg-brand-subtle"
          >
            Langganan Sekarang
          </Link>
        </div>
      )}
    </section>
  );
}
