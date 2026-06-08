import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AppContext';
import { supabase } from '@/services/supabaseClient';

export default function SubscriptionStatusPage() {
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestSubscription() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setSub(data);
        }
      } catch (err) {
        console.error('Error fetching subscription status:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLatestSubscription();
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPlanLabel = (plan) => {
    return plan === '1bulan' ? '1 Bulan' : '1 Tahun';
  };

  if (loading) {
    return (
      <section className="akun-content bg-white rounded-xl border border-[#e5e7eb] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-10 h-fit flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
          <p className="mt-4 text-[#777] text-[14px]">Memuat status langganan...</p>
        </div>
      </section>
    );
  }

  // State 1: Subscription is active
  if (sub && sub.status === 'active') {
    return (
      <section className="akun-content bg-white rounded-xl border border-[#e5e7eb] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-10 h-fit">
        <h1 className="akun-page-title font-playfair text-[28px] text-[#111827] mb-8 pb-4 border-b border-[#e5e7eb]">Status Langganan</h1>
        
        <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-6 mb-8 flex items-center gap-4 animate-[fadeIn_0.5s_ease_out]">
          <div className="w-12 h-12 rounded-full bg-[#10b981]/20 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[#059669] mb-1">Langganan Aktif</h3>
            <p className="text-[14px] text-[#065f46]">Akses penuh ke seluruh konten Pengawal Eksklusif.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 mb-8">
          <div className="bg-[#f9fafb] rounded-lg p-5 border border-[#e5e7eb]">
            <span className="text-[12px] text-[#6b7280] uppercase">Status</span>
            <p className="text-[17px] font-bold text-[#059669] mt-1">● Aktif</p>
          </div>
          <div className="bg-[#f9fafb] rounded-lg p-5 border border-[#e5e7eb]">
            <span className="text-[12px] text-[#6b7280] uppercase">Paket</span>
            <p className="text-[17px] font-bold text-[#111827] mt-1">{getPlanLabel(sub.plan)}</p>
          </div>
          <div className="bg-[#f9fafb] rounded-lg p-5 border border-[#e5e7eb]">
            <span className="text-[12px] text-[#6b7280] uppercase">Berlaku Sejak</span>
            <p className="text-[15px] font-semibold text-[#111827] mt-1">{formatDate(sub.starts_at)}</p>
          </div>
          <div className="bg-[#f9fafb] rounded-lg p-5 border border-[#e5e7eb]">
            <span className="text-[12px] text-[#6b7280] uppercase">Berlaku Sampai</span>
            <p className="text-[15px] font-semibold text-[#111827] mt-1">{formatDate(sub.expires_at)}</p>
          </div>
        </div>
      </section>
    );
  }

  // State 2: Subscription is pending approval
  if (sub && sub.status === 'pending') {
    return (
      <section className="akun-content bg-white rounded-xl border border-[#e5e7eb] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-10 h-fit">
        <h1 className="akun-page-title font-playfair text-[28px] text-[#111827] mb-8 pb-4 border-b border-[#e5e7eb]">Status Langganan</h1>
        
        <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-6 mb-8 flex items-center gap-4 animate-[fadeIn_0.5s_ease_out]">
          <div className="w-12 h-12 rounded-full bg-[#f59e0b]/20 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-[#d97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[#d97706] mb-1">Menunggu Konfirmasi</h3>
            <p className="text-[14px] text-[#b45309]">Pembayaran Anda sedang diverifikasi oleh administrator kami.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 mb-8">
          <div className="bg-[#f9fafb] rounded-lg p-5 border border-[#e5e7eb]">
            <span className="text-[12px] text-[#6b7280] uppercase">Status</span>
            <p className="text-[17px] font-bold text-[#d97706] mt-1">● Menunggu Konfirmasi</p>
          </div>
          <div className="bg-[#f9fafb] rounded-lg p-5 border border-[#e5e7eb]">
            <span className="text-[12px] text-[#6b7280] uppercase">Paket</span>
            <p className="text-[17px] font-bold text-[#111827] mt-1">{getPlanLabel(sub.plan)}</p>
          </div>
          <div className="bg-[#f9fafb] rounded-lg p-5 border border-[#e5e7eb]">
            <span className="text-[12px] text-[#6b7280] uppercase">Metode Pembayaran</span>
            <p className="text-[15px] font-semibold text-[#111827] mt-1">{sub.payment_method?.toUpperCase() || '-'}</p>
          </div>
          <div className="bg-[#f9fafb] rounded-lg p-5 border border-[#e5e7eb]">
            <span className="text-[12px] text-[#6b7280] uppercase">Tanggal Tagihan</span>
            <p className="text-[15px] font-semibold text-[#111827] mt-1">{formatDate(sub.created_at)}</p>
          </div>
        </div>
      </section>
    );
  }

  // State 3: No subscription (or expired/cancelled)
  return (
    <section className="akun-content bg-white rounded-xl border border-[#e5e7eb] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-10 h-fit">
      <h1 className="akun-page-title font-playfair text-[28px] text-[#111827] mb-8 pb-4 border-b border-[#e5e7eb]">Status Langganan</h1>
      <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-8 text-center">
        <h3 className="text-[18px] font-bold text-[#374151] mb-2">Belum Berlangganan</h3>
        <p className="text-[14px] text-[#6b7280] mb-6">Berlangganan untuk akses penuh ke konten Pengawal Eksklusif.</p>
        <Link to="/subscription" className="inline-block bg-brand text-white py-3 px-8 rounded-lg no-underline text-[15px] font-semibold hover:bg-brand-hover transition-colors">
          Mulai Berlangganan
        </Link>
      </div>
    </section>
  );
}
