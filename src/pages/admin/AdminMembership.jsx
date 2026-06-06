import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabaseClient';
import { useToast } from '@/context/AppContext';

export default function AdminMembership() {
  const { addToast } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Plan definitions (matching subscription plan values)
  const planInfo = {
    '1bulan': { name: 'Langganan 1 Bulan', price: 'Rp 49.000', duration: '30 hari' },
    '1tahun': { name: 'Langganan 1 Tahun', price: 'Rp 411.600', duration: '365 hari' },
  };

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles!user_id ( full_name, email, username )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (err) {
      console.error(err);
      addToast('Gagal memuat data langganan: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  const handleUpdateStatus = async (subId, newStatus) => {
    setActionLoading(subId);
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: newStatus })
        .eq('id', subId);

      if (error) throw error;
      addToast(`Status langganan berhasil diubah ke ${newStatus}`, 'success');
      await fetchSubscriptions();
    } catch (err) {
      addToast('Gagal mengubah status: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
  const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const statusBadge = (status) => {
    const map = {
      active: {
        bg: '#dcfce7',
        color: '#166534',
        icon: (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ),
        label: 'Aktif'
      },
      expired: {
        bg: '#fee2e2',
        color: '#991b1b',
        icon: (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Expired'
      },
      cancelled: {
        bg: '#f3f4f6',
        color: '#374151',
        icon: (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
        label: 'Dibatalkan'
      },
    };
    const s = map[status] || map.expired;
    return (
      <span style={{ background: s.bg, color: s.color }} className="py-1 px-2.5 rounded text-[11px] font-semibold inline-flex items-center gap-1">
        <span className="flex items-center justify-center shrink-0">{s.icon}</span> {s.label}
      </span>
    );
  };

  // Stats
  const totalActive = subscriptions.filter(s => s.status === 'active').length;
  const totalExpired = subscriptions.filter(s => s.status === 'expired').length;
  const totalRevenue = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.amount || 0), 0);
  const monthly = subscriptions.filter(s => s.plan === '1bulan' && s.status === 'active').length;
  const yearly = subscriptions.filter(s => s.plan === '1tahun' && s.status === 'active').length;

  // Filter
  const filtered = filterStatus === 'all'
    ? subscriptions
    : subscriptions.filter(s => s.status === filterStatus);

  const statusCounts = {
    all: subscriptions.length,
    active: totalActive,
    expired: totalExpired,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
  };

  return (
    <>
      <div className="mb-1">
        <h1 className="text-[22px] font-bold text-navy">Paket Membership</h1>
        <p className="text-[13.5px] text-[#888] mt-1">Kelola paket langganan dan lihat data pelanggan</p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-2 gap-5">
        {Object.entries(planInfo).map(([key, plan]) => {
          const activeCount = subscriptions.filter(s => s.plan === key && s.status === 'active').length;
          const totalCount = subscriptions.filter(s => s.plan === key).length;
          return (
            <div key={key} className="bg-white border border-[#dcdcdc] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[17px] font-bold text-navy mb-1">{plan.name}</h3>
                  <p className="text-[12px] text-[#888]">Durasi: {plan.duration}</p>
                </div>
                <span className="bg-[#eff6ff] text-brand text-[11px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008z" />
                  </svg>
                  {key}
                </span>
              </div>
              <p className="text-[28px] font-extrabold text-[#333] mb-5">{plan.price}<span className="text-[14px] font-normal text-[#888]">/{key === '1bulan' ? 'bulan' : 'tahun'}</span></p>
              <div className="flex flex-col gap-2.5 pt-4 border-t border-[#f0f0f0]">
                <div className="flex justify-between text-[13.5px]">
                  <span className="text-[#666]">Pelanggan Aktif</span>
                  <span className="font-bold text-[#059669]">{activeCount}</span>
                </div>
                <div className="flex justify-between text-[13.5px]">
                  <span className="text-[#666]">Total Pernah Berlangganan</span>
                  <span className="font-bold text-[#333]">{totalCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Total Langganan',
            val: subscriptions.length,
            icon: (
              <svg className="w-5 h-5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            ),
            color: '#3b82f6',
            bg: '#eff6ff'
          },
          {
            label: 'Pelanggan Aktif',
            val: totalActive,
            icon: (
              <svg className="w-5 h-5 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            color: '#059669',
            bg: '#ecfdf5'
          },
          {
            label: 'Bulanan Aktif',
            val: monthly,
            icon: (
              <svg className="w-5 h-5 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            ),
            color: '#8b5cf6',
            bg: '#f5f3ff'
          },
          {
            label: 'Tahunan Aktif',
            val: yearly,
            icon: (
              <svg className="w-5 h-5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            ),
            color: '#f59e0b',
            bg: '#fffbeb'
          },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#dcdcdc] rounded-lg p-4 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              {s.icon}
            </div>
            <div>
              <div className="text-[22px] font-bold" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[11.5px] text-[#666]">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'active', label: 'Aktif' },
          { key: 'expired', label: 'Expired' },
          { key: 'cancelled', label: 'Dibatalkan' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`py-2 px-3.5 rounded-lg text-[12px] font-semibold border cursor-pointer transition-all duration-200 ${filterStatus === f.key
              ? 'bg-brand text-white border-brand'
              : 'bg-white text-[#555] border-[#dcdcdc] hover:bg-[#f5f5f5]'
            }`}
          >
            {f.label} ({statusCounts[f.key]})
          </button>
        ))}
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white border border-[#dcdcdc] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            <span className="ml-3 text-[14px] text-[#777]">Memuat data langganan...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-3 text-[#cbd5e1]">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-[#333] mb-1">
              {subscriptions.length === 0 ? 'Belum ada data langganan' : 'Tidak ada langganan dengan filter ini'}
            </p>
            <p className="text-[13px] text-[#888]">
              {subscriptions.length === 0
                ? 'Data akan muncul saat pengguna berlangganan membership.'
                : 'Coba ubah filter untuk melihat data lain.'}
            </p>
          </div>
        ) : (
          <table className="data-table w-full border-collapse">
            <thead>
              <tr>
                <th>Pelanggan</th>
                <th>Paket</th>
                <th>Pembayaran</th>
                <th>Mulai</th>
                <th>Berakhir</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => {
                const isProcessing = actionLoading === sub.id;
                const plan = planInfo[sub.plan] || { name: sub.plan };
                const isExpired = sub.expires_at && new Date(sub.expires_at) < new Date();

                return (
                  <tr key={sub.id} className={isProcessing ? 'opacity-50 pointer-events-none' : ''}>
                    <td>
                      <div>
                        <div className="font-semibold text-[13.5px]">{sub.profiles?.full_name || 'Unknown'}</div>
                        <div className="text-[11.5px] text-[#888]">{sub.profiles?.email || ''}</div>
                      </div>
                    </td>
                    <td className="text-[13px] font-medium">{plan.name}</td>
                    <td className="text-[13px] font-semibold text-[#333]">{formatCurrency(sub.amount)}</td>
                    <td className="text-[13px] whitespace-nowrap">{formatDate(sub.starts_at)}</td>
                    <td className="text-[13px] whitespace-nowrap">
                      <span className={isExpired && sub.status === 'active' ? 'text-[#dc2626] font-semibold' : ''}>
                        {formatDate(sub.expires_at)}
                      </span>
                    </td>
                    <td>{statusBadge(sub.status)}</td>
                    <td>
                      <select
                        value={sub.status}
                        onChange={(e) => handleUpdateStatus(sub.id, e.target.value)}
                        disabled={isProcessing}
                        className="py-1.5 px-2 border border-[#dcdcdc] rounded text-[12px] bg-white cursor-pointer outline-none focus:border-brand"
                      >
                        <option value="active">Aktif</option>
                        <option value="expired">Expired</option>
                        <option value="cancelled">Dibatalkan</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
