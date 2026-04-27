import NewsCard from './NewsCard';

export default function NewsGrid({ articles, categorySlug, columns = 3 }) {
  if (!articles || articles.length === 0) {
    return (
      <div className="error-state text-center py-12 px-6 col-span-3">
        <div className="text-[48px] mb-4">📭</div>
        <h3 className="text-[20px] text-[#333] mb-2 font-semibold">Tidak Ada Berita</h3>
        <p className="text-[14px] text-[#777]">Belum ada berita untuk kategori ini saat ini.</p>
      </div>
    );
  }

  return (
    <>
      {articles.map((article, index) => (
        <NewsCard key={article.url || index} article={article} categorySlug={categorySlug} />
      ))}
    </>
  );
}
