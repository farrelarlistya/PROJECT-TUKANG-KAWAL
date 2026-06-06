import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/context/AppContext';
import { getAllArticlesForAdmin, approveArticle, rejectArticle, deleteArticle } from '@/services/articleService';

const STATUS_CONFIG = {
  pending: {
    label: 'Menunggu',
    bg: 'bg-[#fef3c7]',
    text: 'text-[#92400e]',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  published: {
    label: 'Diterbitkan',
    bg: 'bg-[#d1fae5]',
    text: 'text-[#065f46]',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    )
  },
  rejected: {
    label: 'Ditolak',
    bg: 'bg-[#fee2e2]',
    text: 'text-[#991b1b]',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  },
  draft: {
    label: 'Draft',
    bg: 'bg-[#e5e7eb]',
    text: 'text-[#374151]',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    )
  },
  review: {
    label: 'Review',
    bg: 'bg-[#dbeafe]',
    text: 'text-[#1e40af]',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    )
  },
};

const TABS = [
  { key: 'all',       label: 'Semua' },
  { key: 'pending',   label: 'Menunggu' },
  { key: 'published', label: 'Diterbitkan' },
  { key: 'rejected',  label: 'Ditolak' },
];

export default function AdminManageArticles() {
  const { addToast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(null); // articleId yang sedang diproses

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllArticlesForAdmin();
      setArticles(data);
    } catch (err) {
      console.error(err);
      addToast('Gagal memuat artikel: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveArticle(id);
      addToast('Artikel berhasil disetujui dan dipublikasikan!', 'success');
      await fetchArticles();
    } catch (err) {
      addToast('Gagal menyetujui artikel: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await rejectArticle(id);
      addToast('Artikel telah ditolak.', 'info');
      await fetchArticles();
    } catch (err) {
      addToast('Gagal menolak artikel: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id, coverUrl) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus artikel ini?')) return;
    setActionLoading(id);
    try {
      await deleteArticle(id, coverUrl);
      addToast('Artikel berhasil dihapus.', 'success');
      await fetchArticles();
    } catch (err) {
      addToast('Gagal menghapus artikel: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = activeTab === 'all' ? articles : articles.filter(a => a.status === activeTab);
  const pendingCount = articles.filter(a => a.status === 'pending').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <div className="mb-1">
        <h1 className="text-[22px] font-bold text-navy">Kelola Artikel</h1>
        <p className="text-[13.5px] text-[#888] mt-1">
          Semua artikel yang tersimpan di sistem
          {pendingCount > 0 && (
            <span className="ml-2 bg-[#fef3c7] text-[#92400e] py-0.5 px-2 rounded-full text-[12px] font-semibold">
              {pendingCount} menunggu persetujuan
            </span>
          )}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-2 px-4 rounded-lg text-[13px] font-semibold border-none cursor-pointer transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-brand text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                : 'bg-[#f0f4f8] text-[#555] hover:bg-[#e2e8f0]'
            }`}
          >
            {tab.label}
            {tab.key === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-white/30 text-current py-0.5 px-1.5 rounded-full text-[11px]">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#dcdcdc] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            <span className="ml-3 text-[14px] text-[#777]">Memuat artikel...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-3 text-[#cbd5e1]">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-[14px] text-[#888]">
              {activeTab === 'all' ? 'Belum ada artikel.' : `Tidak ada artikel dengan status "${TABS.find(t => t.key === activeTab)?.label}".`}
            </p>
          </div>
        ) : (
          <table className="data-table w-full border-collapse">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Penulis</th>
                <th>Kategori</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.draft;
                const isProcessing = actionLoading === a.id;
                return (
                  <tr key={a.id} className={isProcessing ? 'opacity-50 pointer-events-none' : ''}>
                    <td className="font-semibold max-w-[250px]">
                      <div className="truncate" title={a.title}>{a.title}</div>
                    </td>
                    <td className="text-[13px]">{a.profiles?.full_name || 'Unknown'}</td>
                    <td className="text-[13px]">{a.categories?.label || '-'}</td>
                    <td className="text-[13px] whitespace-nowrap">{formatDate(a.created_at)}</td>
                    <td>
                      <span className={`py-1 px-2.5 rounded text-[12px] font-semibold inline-flex items-center gap-1 ${cfg.bg} ${cfg.text}`}>
                        <span>{cfg.icon}</span> {cfg.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 flex-wrap">
                        {a.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(a.id)}
                              disabled={isProcessing}
                              className="bg-[#059669] text-white py-1.5 px-3 rounded text-[12px] font-semibold border-none cursor-pointer hover:bg-[#047857] transition-colors disabled:opacity-50"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => handleReject(a.id)}
                              disabled={isProcessing}
                              className="bg-[#f59e0b] text-white py-1.5 px-3 rounded text-[12px] font-semibold border-none cursor-pointer hover:bg-[#d97706] transition-colors disabled:opacity-50"
                            >
                              Tolak
                            </button>
                          </>
                        )}
                        {a.status === 'rejected' && (
                          <button
                            onClick={() => handleApprove(a.id)}
                            disabled={isProcessing}
                            className="bg-[#059669] text-white py-1.5 px-3 rounded text-[12px] font-semibold border-none cursor-pointer hover:bg-[#047857] transition-colors disabled:opacity-50"
                          >
                            Setujui
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(a.id, a.cover_image_url)}
                          disabled={isProcessing}
                          className="bg-[#dc2626] text-white py-1.5 px-3 rounded text-[12px] font-semibold border-none cursor-pointer hover:bg-[#b91c1c] transition-colors disabled:opacity-50"
                        >
                          Hapus
                        </button>
                      </div>
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
