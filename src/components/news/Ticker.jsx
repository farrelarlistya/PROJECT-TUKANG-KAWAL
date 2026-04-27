import { memo } from 'react';

const Ticker = memo(function Ticker({ articles }) {
  const text = (!articles || articles.length === 0)
    ? 'Selamat datang di TukangKawal — Portal Berita Terpercaya'
    : articles.slice(0, 5).map(a => a.title).join(' • ');

  return (
    <div className="ticker bg-brand p-2">
      <marquee>{text}</marquee>
    </div>
  );
});

export default Ticker;
