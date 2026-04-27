import { Link } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';

export default function NotFound() {
  return (
    <PageWrapper showCategories={false}>
      <main className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="text-[80px] mb-4">🔍</div>
        <h1 className="text-[36px] font-bold text-[#222] mb-3">404</h1>
        <p className="text-[16px] text-[#777] mb-8 max-w-[400px]">Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.</p>
        <Link to="/" className="bg-brand text-white py-3 px-8 rounded-lg no-underline text-[15px] font-semibold hover:bg-brand-hover transition-colors">
          Kembali ke Beranda
        </Link>
      </main>
    </PageWrapper>
  );
}
