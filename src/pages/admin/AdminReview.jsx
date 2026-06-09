import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/context/AppContext';
import { getPendingArticles, approveArticle, rejectArticle } from '@/services/articleService';

export default function AdminReview() {
  const { addToast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [previewArticle, setPreviewArticle] = useState(null);
  const [isExclusive, setIsExclusive] = useState(false);

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPendingArticles();
      setArticles(data);
    } catch (err) {
      console.error(err);
      addToast('Gagal memuat artikel pending: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveArticle(id, isExclusive);
      addToast('Artikel berhasil disetujui dan dipublikasikan!', 'success');
      setPreviewArticle(null);
      await fetchPending();
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
      setPreviewArticle(null);
      await fetchPending();
    } catch (err) {
      addToast('Gagal menolak artikel: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="mb-1">
        <h1 className="text-[22px] font-bold text-navy">Review & Persetujuan</h1>
        <p className="text-[13.5px] text-[#888] mt-1">
          Artikel yang memerlukan tinjauan redaksi
          {articles.length > 0 && (
            <span className="ml-2 bg-[#fef3c7] text-[#92400e] py-0.5 px-2 rounded-full text-[12px] font-semibold">
              {articles.length} artikel menunggu
            </span>
          )}
        </p>
      </div>
      <div className="bg-white border border-[#dcdcdc] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            <span className="ml-3 text-[14px] text-[#777]">Memuat artikel...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-3 text-emerald-500">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-[#333] mb-1">Tidak ada artikel yang perlu direview</p>
            <p className="text-[13px] text-[#888]">Semua artikel sudah ditinjau.</p>
          </div>
        ) : (
          <table className="data-table w-full border-collapse">
            <thead>
              <tr>
                <th>Judul Artikel</th>
                <th>Penulis</th>
                <th>Kategori</th>
                <th>Tanggal Kirim</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => {
                const isProcessing = actionLoading === a.id;
                return (
                  <tr key={a.id} className={isProcessing ? 'opacity-50 pointer-events-none' : ''}>
                    <td className="font-semibold max-w-[280px]">
                      <div className="truncate" title={a.title}>{a.title}</div>
                      {a.description && (
                        <div className="text-[12px] text-[#888] mt-0.5 truncate" title={a.description}>{a.description}</div>
                      )}
                    </td>
                    <td className="text-[13px]">{a.profiles?.full_name || 'Unknown'}</td>
                    <td className="text-[13px]">{a.categories?.label || '-'}</td>
                    <td className="text-[13px] whitespace-nowrap">{formatDate(a.created_at)}</td>
                    <td>
                      <span className="bg-[#fef3c7] text-[#92400e] py-1 px-2.5 rounded text-[12px] font-semibold inline-flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Menunggu
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setPreviewArticle(a); setIsExclusive(a.is_exclusive || false); }}
                          className="bg-[#2563eb] text-white py-1.5 px-3 rounded text-[12px] font-semibold border-none cursor-pointer hover:bg-[#1d4ed8] transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Lihat
                        </button>
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
                          className="bg-[#dc2626] text-white py-1.5 px-3 rounded text-[12px] font-semibold border-none cursor-pointer hover:bg-[#b91c1c] transition-colors disabled:opacity-50"
                        >
                          Tolak
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

      {/* ═══ Modal Preview Artikel ═══ */}
      {previewArticle && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={() => setPreviewArticle(null)}
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modalSlideIn 0.25s ease-out' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb] bg-[#f9fafb]">
              <div className="flex items-center gap-3">
                <span className="text-[20px] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#111827]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-[18px] font-bold text-[#111827] leading-tight">Preview Artikel</h2>
                  <p className="text-[12px] text-[#6b7280] mt-0.5">Review konten sebelum disetujui</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewArticle(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f3f4f6] hover:bg-[#e5e7eb] border-none cursor-pointer text-[#6b7280] hover:text-[#111827] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body — Scrollable */}
            <div className="overflow-y-auto flex-1 px-6 py-5" style={{ maxHeight: 'calc(90vh - 160px)' }}>
              {/* Cover Image */}
              {previewArticle.cover_image_url ? (
                <div className="mb-5 rounded-xl overflow-hidden border border-[#e5e7eb]">
                  <img
                    src={previewArticle.cover_image_url}
                    alt="Cover artikel"
                    className="w-full aspect-[16/9] object-cover"
                  />
                </div>
              ) : (
                <div className="mb-5 rounded-xl border-2 border-dashed border-[#d1d5db] bg-[#f9fafb] flex items-center justify-center py-12">
                  <div className="text-center text-[#9ca3af]">
                    <div className="flex justify-center mb-1">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <span className="text-[13px]">Tidak ada gambar cover</span>
                  </div>
                </div>
              )}

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-[#f9fafb] rounded-lg p-3 border border-[#e5e7eb]">
                  <div className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-1">Penulis</div>
                  <div className="text-[14px] font-medium text-[#111827] flex items-center gap-2">
                    {previewArticle.profiles?.avatar_url ? (
                      <img src={previewArticle.profiles.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-[#2563eb] text-white text-[10px] font-bold flex items-center justify-center">
                        {previewArticle.profiles?.initials || '?'}
                      </span>
                    )}
                    {previewArticle.profiles?.full_name || 'Unknown'}
                  </div>
                </div>
                <div className="bg-[#f9fafb] rounded-lg p-3 border border-[#e5e7eb]">
                  <div className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-1">Kategori</div>
                  <div className="text-[14px] font-medium text-[#111827]">
                    {previewArticle.categories?.icon} {previewArticle.categories?.label || '-'}
                  </div>
                </div>
                <div className="bg-[#f9fafb] rounded-lg p-3 border border-[#e5e7eb]">
                  <div className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-1">Tanggal Kirim</div>
                  <div className="text-[14px] font-medium text-[#111827]">{formatDate(previewArticle.created_at)}</div>
                </div>
                <div className="bg-[#f9fafb] rounded-lg p-3 border border-[#e5e7eb]">
                  <div className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-1">Tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {previewArticle.tags && previewArticle.tags.length > 0 ? (
                      previewArticle.tags.map((tag, i) => (
                        <span key={i} className="bg-[#dbeafe] text-[#1e40af] text-[11px] font-medium py-0.5 px-2 rounded-full">
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[13px] text-[#9ca3af]">Tidak ada tag</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-[22px] font-bold text-[#111827] mb-1 leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
                {previewArticle.title}
              </h3>

              {/* Description */}
              {previewArticle.description && (
                <p className="text-[14px] text-[#6b7280] mb-4 italic">{previewArticle.description}</p>
              )}

              {/* Divider */}
              <hr className="border-[#e5e7eb] my-4" />

              {/* Full Content */}
              <div
                className="text-[15px] text-[#374151] leading-[1.8]"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {previewArticle.content}
              </div>
            </div>

            {/* Footer — Action Buttons */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb]">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPreviewArticle(null)}
                  className="bg-[#f3f4f6] text-[#374151] py-2.5 px-5 rounded-lg text-[13px] font-semibold border border-[#d1d5db] cursor-pointer hover:bg-[#e5e7eb] transition-colors"
                >
                  Tutup
                </button>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#1e3a8a] cursor-pointer"
                    checked={isExclusive}
                    onChange={(e) => setIsExclusive(e.target.checked)}
                    disabled={actionLoading === previewArticle.id}
                  />
                  <span className="text-[13px] font-semibold text-[#111827]">Jadikan Eksklusif</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleReject(previewArticle.id)}
                  disabled={actionLoading === previewArticle.id}
                  className="bg-[#dc2626] text-white py-2.5 px-5 rounded-lg text-[13px] font-semibold border-none cursor-pointer hover:bg-[#b91c1c] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Tolak Artikel
                </button>
                <button
                  onClick={() => handleApprove(previewArticle.id)}
                  disabled={actionLoading === previewArticle.id}
                  className="bg-[#059669] text-white py-2.5 px-5 rounded-lg text-[13px] font-semibold border-none cursor-pointer hover:bg-[#047857] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Setujui & Publikasikan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal animation */}
      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
