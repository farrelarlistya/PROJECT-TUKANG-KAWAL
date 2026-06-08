import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabaseClient';
import { useToast } from '@/context/AppContext';

export default function AdminTransaksi() {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles ( full_name, email, username, phone_wa )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[AdminTransaksi] Query error:', error);
        throw error;
      }
      
      console.log('[AdminTransaksi] Data loaded:', data?.length, 'transactions');
      setTransactions(data || []);
    } catch (err) {
      console.error('[AdminTransaksi] Error:', err);
      addToast('Gagal memuat riwayat transaksi: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
  const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const statusBadge = (status) => {
    const map = {
      pending: { bg: '#fef3c7', color: '#92400e', label: 'Menunggu Konfirmasi' },
      active: { bg: '#dcfce7', color: '#166534', label: 'Aktif' },
      expired: { bg: '#fee2e2', color: '#991b1b', label: 'Expired' },
      cancelled: { bg: '#f3f4f6', color: '#374151', label: 'Dibatalkan' },
    };
    const s = map[status] || map.pending;
    return (
      <span style={{ background: s.bg, color: s.color }} className="py-1 px-2.5 rounded text-[11px] font-semibold inline-flex items-center gap-1">
        {s.label}
      </span>
    );
  };

  const paymentLabel = (method) => {
    const map = { bca: 'BCA VA', mandiri: 'Mandiri VA', gopay: 'GoPay', ovo: 'OVO', qris: 'QRIS' };
    return map[method] || method;
  };

  const planLabel = (plan) => {
    const map = { '1bulan': '1 Bulan', '1tahun': '1 Tahun' };
    return map[plan] || plan;
  };

  // Stats
  const totalRevenue = transactions.filter(t => t.status === 'active').reduce((s, t) => s + (t.amount || 0), 0);
  const totalPending = transactions.filter(t => t.status === 'pending').length;
  const totalActive = transactions.filter(t => t.status === 'active').length;
  const totalAll = transactions.length;

  // Filter & search
  const filtered = transactions.filter(t => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchSearch = !searchQuery || 
      (t.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.profiles?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.virtual_account || '').includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const statusCounts = {
    all: totalAll,
    pending: totalPending,
    active: totalActive,
    expired: transactions.filter(t => t.status === 'expired').length,
    cancelled: transactions.filter(t => t.status === 'cancelled').length,
  };

  return (
    <>
      <div className="mb-1">
        <h1 className="text-[22px] font-bold text-navy">Riwayat Transaksi</h1>
        <p className="text-[13.5px] text-[#888] mt-1">Lihat seluruh riwayat transaksi subscription pengguna</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Total Transaksi', val: totalAll, color: '#3b82f6', bg: '#eff6ff',
            icon: <svg className="w-5 h-5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
          },
          {
            label: 'Menunggu Konfirmasi', val: totalPending, color: '#f59e0b', bg: '#fffbeb',
            icon: <svg className="w-5 h-5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          },
          {
            label: 'Transaksi Aktif', val: totalActive, color: '#059669', bg: '#ecfdf5',
            icon: <svg className="w-5 h-5 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          },
          {
            label: 'Total Revenue', val: formatCurrency(totalRevenue), color: '#8b5cf6', bg: '#f5f3ff',
            icon: <svg className="w-5 h-5 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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

      {/* Filter + Search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'pending', label: 'Menunggu' },
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
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama, email, atau VA..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border border-[#dcdcdc] rounded-lg text-[12px] w-[240px] outline-none focus:border-brand bg-white"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-[#dcdcdc] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            <span className="ml-3 text-[14px] text-[#777]">Memuat riwayat transaksi...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-3 text-[#cbd5e1]">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-[#333] mb-1">
              {transactions.length === 0 ? 'Belum ada transaksi' : 'Tidak ada transaksi dengan filter ini'}
            </p>
            <p className="text-[13px] text-[#888]">
              {transactions.length === 0
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
              {filtered.map((tx) => (
                <tr key={tx.id}>
                  <td className="text-[12px] text-[#666] whitespace-nowrap">{formatDate(tx.created_at)}</td>
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
    </>
  );
}
