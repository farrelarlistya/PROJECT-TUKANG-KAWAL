import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabaseClient';
import { useToast } from '@/context/AppContext';

export default function AdminMembership() {
  const { addToast } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Main Tab State: 'membership' or 'transactions'
  const [activeTab, setActiveTab] = useState('membership');

  // Filter & Search states for each tab
  const [filterStatusMembership, setFilterStatusMembership] = useState('all');
  const [filterStatusTransaksi, setFilterStatusTransaksi] = useState('all');
  const [searchQueryTransaksi, setSearchQueryTransaksi] = useState('');

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
          profiles ( full_name, email, username, phone_wa, role )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[AdminMembership] Query error:', error);
        throw error;
      }
      
      console.log('[AdminMembership] Data loaded:', data?.length, 'subscriptions');
      setSubscriptions(data || []);
    } catch (err) {
      console.error('[AdminMembership] Error:', err);
      addToast('Gagal memuat data langganan: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleUpdateStatus = async (subId, newStatus) => {
    setActionLoading(subId);
    try {
      // Find subscription details
      const sub = subscriptions.find(s => s.id === subId);
      if (!sub) throw new Error('Data langganan tidak ditemukan.');

      const userId = sub.user_id;
      const plan = sub.plan;
      let updateFields = { status: newStatus };

      if (newStatus === 'active') {
        const now = new Date();
        const startsAt = now.toISOString();
        const confirmedAt = now.toISOString();
        
        const expires = new Date(now);
        if (plan === '1bulan') {
          expires.setDate(expires.getDate() + 30);
        } else if (plan === '1tahun') {
          expires.setDate(expires.getDate() + 365);
        } else {
          expires.setDate(expires.getDate() + 30);
        }
        const expiresAt = expires.toISOString();

        updateFields = {
          ...updateFields,
          starts_at: startsAt,
          expires_at: expiresAt,
          confirmed_at: confirmedAt
        };
      }

      // 1. Update subscription status
      const { error: subError } = await supabase
        .from('subscriptions')
        .update(updateFields)
        .eq('id', subId);

      if (subError) throw subError;

      // 2. Update profiles role (ensure we don't accidentally downgrade admin)
      if (sub.profiles?.role !== 'admin') {
        const newRole = newStatus === 'active' ? 'member' : 'non-member';
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', userId);

        if (profileError) {
          console.error('[AdminMembership] Error updating profile role:', profileError);
          throw new Error('Gagal memperbarui role pengguna: ' + profileError.message);
        }
      }

      addToast(`Status langganan berhasil diubah ke ${newStatus} dan role pengguna diperbarui.`, 'success');
      await fetchSubscriptions();
    } catch (err) {
      console.error('[AdminMembership] Status update error:', err);
      addToast('Gagal mengubah status: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d, includeTime = false) => {
    if (!d) return '-';
    const options = includeTime 
      ? { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(d).toLocaleDateString('id-ID', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const paymentLabel = (method) => {
    const map = { bca: 'BCA VA', mandiri: 'Mandiri VA', gopay: 'GoPay', ovo: 'OVO', qris: 'QRIS' };
    return map[method] || method;
  };

  const planLabel = (plan) => {
    const map = { '1bulan': '1 Bulan', '1tahun': '1 Tahun' };
    return map[plan] || plan;
  };

  const statusBadge = (status) => {
    const map = {
      pending: {
        bg: '#fef3c7',
        color: '#92400e',
        icon: (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Menunggu'
      },
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
    const s = map[status] || map.pending;
    return (
      <span style={{ background: s.bg, color: s.color }} className="py-1 px-2.5 rounded text-[11px] font-semibold inline-flex items-center gap-1">
        <span className="flex items-center justify-center shrink-0">{s.icon}</span> {s.label}
      </span>
    );
  };

  // --- STATS COMPUTATIONS ---
  const totalAll = subscriptions.length;
  const totalActive = subscriptions.filter(s => s.status === 'active').length;
  const totalExpired = subscriptions.filter(s => s.status === 'expired').length;
  const totalPending = subscriptions.filter(s => s.status === 'pending').length;
  const totalCancelled = subscriptions.filter(s => s.status === 'cancelled').length;
  const totalRevenue = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.amount || 0), 0);

  // --- FILTER & SEARCH ---
  const filteredMembership = filterStatusMembership === 'all'
    ? subscriptions
    : subscriptions.filter(s => s.status === filterStatusMembership);

  const filteredTransactions = subscriptions.filter(t => {
    const matchStatus = filterStatusTransaksi === 'all' || t.status === filterStatusTransaksi;
    const matchSearch = !searchQueryTransaksi || 
      (t.profiles?.full_name || '').toLowerCase().includes(searchQueryTransaksi.toLowerCase()) ||
      (t.profiles?.email || '').toLowerCase().includes(searchQueryTransaksi.toLowerCase()) ||
      (t.virtual_account || '').includes(searchQueryTransaksi);
    return matchStatus && matchSearch;
  });

  const statusCountsMembership = {
    all: totalAll,
    pending: totalPending,
    active: totalActive,
    expired: totalExpired,
    cancelled: totalCancelled,
  };

  const statusCountsTransaksi = {
    all: totalAll,
    pending: totalPending,
    active: totalActive,
    expired: totalExpired,
    cancelled: totalCancelled,
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-navy">Kelola Membership & Transaksi</h1>
        <p className="text-[13.5px] text-[#888] mt-1">
          Pantau status berlangganan serta kelola paket keanggotaan pengguna.
        </p>
      </div>

      {/* Combined Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'Total Langganan',
            val: totalAll,
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
            label: 'Total Pendapatan',
            val: formatCurrency(totalRevenue),
            icon: (
              <svg className="w-5 h-5 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            color: '#8b5cf6',
            bg: '#f5f3ff'
          },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#dcdcdc] rounded-lg p-4 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              {s.icon}
            </div>
            <div>
              <div className="text-[20px] font-bold" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[11.5px] text-[#666]">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#e5e7eb] pb-3">
        {[
          { key: 'membership', label: 'Kelola Paket & Pelanggan' },
          { key: 'transactions', label: 'Riwayat Transaksi' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-2.5 px-5 rounded-lg text-[13.5px] font-bold border-none cursor-pointer transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-brand text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                : 'bg-[#f0f4f8] text-[#555] hover:bg-[#e2e8f0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Tab Contents */}
      {activeTab === 'membership' ? (
        <div className="space-y-6">
          {/* Plan Info Cards */}
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
                  <p className="text-[28px] font-extrabold text-[#333] mb-5">
                    {plan.price}
                    <span className="text-[14px] font-normal text-[#888]">
                      /{key === '1bulan' ? 'bulan' : 'tahun'}
                    </span>
                  </p>
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

          {/* Subscriptions Filter Tabs */}
          <div className="flex items-center gap-2">
            {[
              { key: 'all', label: 'Semua' },
              { key: 'active', label: 'Aktif' },
              { key: 'expired', label: 'Expired' },
              { key: 'cancelled', label: 'Dibatalkan' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterStatusMembership(f.key)}
                className={`py-2 px-3.5 rounded-lg text-[12px] font-semibold border cursor-pointer transition-all duration-200 ${
                  filterStatusMembership === f.key
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white text-[#555] border-[#dcdcdc] hover:bg-[#f5f5f5]'
                }`}
              >
                {f.label} ({statusCountsMembership[f.key]})
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
            ) : filteredMembership.length === 0 ? (
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
                  {filteredMembership.map((sub) => {
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
        </div>
      ) : (
        <div className="space-y-6">
          {/* Riwayat Transaksi Filter + Search */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {[
                { key: 'all', label: 'Semua' },
                { key: 'active', label: 'Aktif' },
                { key: 'expired', label: 'Expired' },
                { key: 'cancelled', label: 'Dibatalkan' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatusTransaksi(f.key)}
                  className={`py-2 px-3.5 rounded-lg text-[12px] font-semibold border cursor-pointer transition-all duration-200 ${
                    filterStatusTransaksi === f.key
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white text-[#555] border-[#dcdcdc] hover:bg-[#f5f5f5]'
                  }`}
                >
                  {f.label} ({statusCountsTransaksi[f.key]})
                </button>
              ))}
            </div>
            
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Cari nama, email, atau VA..."
                value={searchQueryTransaksi}
                onChange={e => setSearchQueryTransaksi(e.target.value)}
                className="pl-9 pr-4 py-2 border border-[#dcdcdc] rounded-lg text-[12px] w-[240px] outline-none focus:border-brand bg-white"
              />
            </div>
          </div>

          {/* Riwayat Transaksi Table */}
          <div className="bg-white border border-[#dcdcdc] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="inline-block w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
                <span className="ml-3 text-[14px] text-[#777]">Memuat riwayat transaksi...</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex justify-center mb-3 text-[#cbd5e1]">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <p className="text-[15px] font-semibold text-[#333] mb-1">
                  {subscriptions.length === 0 ? 'Belum ada transaksi' : 'Tidak ada transaksi dengan filter ini'}
                </p>
                <p className="text-[13px] text-[#888]">
                  {subscriptions.length === 0
                    ? 'Data akan muncul saat pengguna melakukan pembayaran.'
                    : 'Coba ubah filter atau kata kunci pencarian.'}
                </p>
              </div>
            ) : (
              <table className="data-table w-full border-collapse">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Pengguna</th>
                    <th>Paket</th>
                    <th>Pembayaran</th>
                    <th>No. VA / Metode</th>
                    <th>Jumlah</th>
                    <th>Periode</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="text-[12px] text-[#666] whitespace-nowrap">{formatDate(tx.created_at, true)}</td>
                      <td>
                        <div>
                          <div className="font-semibold text-[13px]">{tx.profiles?.full_name || 'Unknown'}</div>
                          <div className="text-[11px] text-[#888]">{tx.profiles?.email || ''}</div>
                        </div>
                      </td>
                      <td className="text-[13px] font-medium">{planLabel(tx.plan)}</td>
                      <td className="text-[12px]">
                        <span className="bg-[#f3f4f6] py-0.5 px-2 rounded text-[11px] font-semibold text-[#374151]">
                          {paymentLabel(tx.payment_method)}
                        </span>
                      </td>
                      <td className="text-[12px] font-mono text-[#555]">{tx.virtual_account || '-'}</td>
                      <td className="text-[13px] font-semibold text-[#333] whitespace-nowrap">{formatCurrency(tx.amount)}</td>
                      <td className="text-[12px] text-[#666] whitespace-nowrap">
                        {tx.starts_at && tx.expires_at ? (
                          <div>
                            <div>{new Date(tx.starts_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
                            <div className="text-[10px] text-[#aaa]">s/d {new Date(tx.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
                          </div>
                        ) : '-'}
                      </td>
                      <td>{statusBadge(tx.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </>
  );
}
