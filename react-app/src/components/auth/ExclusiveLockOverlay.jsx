import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AppContext';
import { USER_ROLES } from '@/utils/constants';

/**
 * ExclusiveLockOverlay — Paywall for non-member on exclusive articles
 */
export default function ExclusiveLockOverlay() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="paywall-overlay">
      <div className="paywall-content">
        <div className="paywall-icon">🔒</div>
        <h3 className="text-[22px] font-bold text-[#111] mb-2">Konten Eksklusif</h3>
        <p className="text-[15px] text-[#555] mb-5 max-w-[400px] mx-auto leading-[1.6]">
          Artikel ini hanya tersedia untuk pelanggan Pengawal Eksklusif. Berlangganan untuk membaca selengkapnya.
        </p>
        <Link
          to={isAuthenticated ? '/subscription' : '/login?redirect=/subscription'}
          className="inline-block bg-brand text-white py-3 px-8 rounded-lg no-underline text-[15px] font-semibold transition-all duration-200 hover:bg-brand-hover hover:-translate-y-[1px]"
        >
          {isAuthenticated ? 'Langganan Sekarang' : 'Masuk untuk Berlangganan'}
        </Link>
      </div>
    </div>
  );
}
