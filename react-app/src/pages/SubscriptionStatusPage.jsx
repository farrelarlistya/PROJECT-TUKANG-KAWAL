import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AppContext';

export default function SubscriptionStatusPage() {
  const { isMember } = useAuth();

  if (isMember) {
    return (
      <section className="akun-content bg-white rounded-xl border border-[#e5e7eb] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-10 h-fit">
        <h1 className="akun-page-title font-playfair text-[28px] text-[#111827] mb-8 pb-4 border-b border-[#e5e7eb]">Status Langganan</h1>
        <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-6 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center shrink-0">✓</div>
          <div>
            <h3 className="text-[16px] font-bold text-brand mb-1">Langganan Aktif</h3>
            <p className="text-[14px] text-[#1e40af]">Akses penuh ke seluruh konten Pengawal Eksklusif.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 mb-8">
          <div className="bg-[#f9fafb] rounded-lg p-5 border border-[#e5e7eb]">
            <span className="text-[12px] text-[#6b7280] uppercase">Status</span>
            <p className="text-[18px] font-bold text-[#059669] mt-1">● Aktif</p>
          </div>
          <div className="bg-[#f9fafb] rounded-lg p-5 border border-[#e5e7eb]">
            <span className="text-[12px] text-[#6b7280] uppercase">Paket</span>
            <p className="text-[18px] font-bold text-[#111827] mt-1">1 Tahun</p>
          </div>
          <div className="bg-[#f9fafb] rounded-lg p-5 border border-[#e5e7eb]">
            <span className="text-[12px] text-[#6b7280] uppercase">Berlaku Sejak</span>
            <p className="text-[16px] font-semibold text-[#111827] mt-1">15 Januari 2026</p>
          </div>
          <div className="bg-[#f9fafb] rounded-lg p-5 border border-[#e5e7eb]">
            <span className="text-[12px] text-[#6b7280] uppercase">Berlaku Sampai</span>
            <p className="text-[16px] font-semibold text-[#111827] mt-1">15 Januari 2027</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="akun-content bg-white rounded-xl border border-[#e5e7eb] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-10 h-fit">
      <h1 className="akun-page-title font-playfair text-[28px] text-[#111827] mb-8 pb-4 border-b border-[#e5e7eb]">Status Langganan</h1>
      <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-8 text-center">
        <h3 className="text-[18px] font-bold text-[#374151] mb-2">Belum Berlangganan</h3>
        <p className="text-[14px] text-[#6b7280] mb-6">Berlangganan untuk akses penuh ke konten Pengawal Eksklusif.</p>
        <Link to="/subscription" className="inline-block bg-brand text-white py-3 px-8 rounded-lg no-underline text-[15px] font-semibold">Mulai Berlangganan</Link>
      </div>
    </section>
  );
}
