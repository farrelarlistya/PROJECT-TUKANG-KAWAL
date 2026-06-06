import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import { useToast } from '@/context/AppContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState({ pending: 0, totalArticles: 0, totalUsers: 0, totalMembers: 0 });
  const [categories, setCategories] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Fetch all stats in parallel
      const [
        { count: pendingCount },
        { count: totalArticles },
        { count: totalUsers },
        { count: totalMembers },
        { data: catData },
        { data: recentArts },
        { data: recentUsrs },
        { data: articlesWithCats }
      ] = await Promise.all([
        supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'member'),
        supabase.from('categories').select('id, slug, label, icon'),
        supabase.from('articles').select('id, title, status, created_at, profiles!author_id(full_name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('id, full_name, email, role, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('articles').select('category_id'),
      ]);

      setStats({
        pending: pendingCount || 0,
        totalArticles: totalArticles || 0,
        totalUsers: totalUsers || 0,
        totalMembers: totalMembers || 0,
      });

      // Count articles per category
      const countMap = {};
      (articlesWithCats || []).forEach(a => {
        if (a.category_id) countMap[a.category_id] = (countMap[a.category_id] || 0) + 1;
      });
      setCategories((catData || []).map(c => ({ ...c, count: countMap[c.id] || 0 })));
      setRecentArticles(recentArts || []);
      setRecentUsers(recentUsrs || []);
    } catch (err) {
      console.error(err);
      addToast('Gagal memuat data dashboard: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  const statusBadge = (status) => {
    const map = {
      published: { bg: '#dcfce7', color: '#166534', label: 'Publish' },
      pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
      rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Ditolak' },
      draft: { bg: '#f3f4f6', color: '#374151', label: 'Draft' },
    };
    const s = map[status] || map.draft;
    return <span style={{ background: s.bg, color: s.color }} className="py-0.5 px-2 rounded text-[11px] font-semibold">{s.label}</span>;
  };

  const roleBadge = (role) => {
    const map = {
      admin: { bg: '#ede9fe', color: '#5b21b6', label: 'Admin' },
      member: { bg: '#dbeafe', color: '#1e40af', label: 'Member' },
      'non-member': { bg: '#f3f4f6', color: '#374151', label: 'Non-Member' },
    };
    const r = map[role] || map['non-member'];
    return <span style={{ background: r.bg, color: r.color }} className="py-0.5 px-2 rounded text-[11px] font-semibold">{r.label}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
        <span className="ml-3 text-[14px] text-[#777]">Memuat dashboard...</span>
      </div>
    );
  }

  const statCards = [
    {
      val: stats.pending,
      label: 'Menunggu Persetujuan',
      icon: (
        <svg className="w-6 h-6 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: '#f59e0b',
      bg: '#fffbeb'
    },
    {
      val: stats.totalArticles,
      label: 'Total Artikel',
      icon: (
        <svg className="w-6 h-6 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      color: '#3b82f6',
      bg: '#eff6ff'
    },
    {
      val: stats.totalUsers,
      label: 'Total Pengguna',
      icon: (
        <svg className="w-6 h-6 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      color: '#8b5cf6',
      bg: '#f5f3ff'
    },
    {
      val: stats.totalMembers,
      label: 'Pelanggan Member',
      icon: (
        <svg className="w-6 h-6 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.195-.39.743-.39.938 0l2.22 4.494 4.965.72c.43.063.602.583.291.887l-3.593 3.499 1.054 4.945c.092.427-.36.756-.745.553L12 16.715l-4.425 2.328c-.385.203-.837-.126-.745-.553l1.054-4.945-3.593-3.499c-.31-.304-.138-.824.291-.887l4.965-.72 2.22-4.494z" />
        </svg>
      ),
      color: '#059669',
      bg: '#ecfdf5'
    },
  ];

  return (
    <>
      <div className="mb-1">
        <h1 className="text-[22px] font-bold text-navy">Dashboard Utama</h1>
        <p className="text-[13.5px] text-[#888] mt-1">Ringkasan aktivitas dan statistik sistem TukangKawal</p>
      </div>

      {/* Stat Cards */}
      <section>
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <div key={i} className="bg-white border border-[#dcdcdc] rounded-lg p-[18px] flex items-start gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-[2px]">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] shrink-0" style={{ backgroundColor: s.bg }}>
                {s.icon}
              </div>
              <div className="flex flex-col">
                <div className="text-[28px] font-bold" style={{ color: s.color }}>{s.val}</div>
                <div className="text-[12.5px] text-[#666] leading-tight">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two columns: Categories + Recent Articles */}
      <div className="grid grid-cols-[1fr_1.4fr] gap-5">
        {/* Categories */}
        <div className="bg-white border border-[#dcdcdc] rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="mb-4 pb-3 border-b border-[#f0f4f8] flex items-center justify-between">
            <span className="text-[15px] font-semibold text-navy">Artikel per Kategori</span>
          </div>
          <ul className="list-none flex flex-col gap-2.5">
            {categories.map((c) => (
              <li key={c.id} className="flex justify-between items-center py-2.5 px-3.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] transition-colors hover:bg-[#f0f4f8]">
                <span className="font-medium text-[13.5px] text-[#333] flex items-center gap-2">
                  <span>{c.icon}</span> {c.label}
                </span>
                <span className="bg-brand text-white py-[2px] px-2.5 rounded-xl text-[11px] font-bold min-w-[28px] text-center">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Articles */}
        <div className="bg-white border border-[#dcdcdc] rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="mb-4 pb-3 border-b border-[#f0f4f8] flex items-center justify-between">
            <span className="text-[15px] font-semibold text-navy">Artikel Terbaru</span>
            <Link to="/admin/articles" className="text-[12px] text-brand font-semibold no-underline hover:underline">Lihat Semua →</Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentArticles.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2.5 px-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] transition-colors hover:bg-[#f0f4f8]">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="text-[13.5px] font-semibold text-[#222] truncate">{a.title}</div>
                  <div className="text-[11.5px] text-[#888] mt-0.5">{a.profiles?.full_name || 'Unknown'} • {formatDate(a.created_at)}</div>
                </div>
                {statusBadge(a.status)}
              </div>
            ))}
            {recentArticles.length === 0 && <p className="text-[13px] text-[#999] text-center py-4">Belum ada artikel.</p>}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white border border-[#dcdcdc] rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="mb-4 pb-3 border-b border-[#f0f4f8] flex items-center justify-between">
          <span className="text-[15px] font-semibold text-navy">Pengguna Terbaru</span>
          <Link to="/admin/users" className="text-[12px] text-brand font-semibold no-underline hover:underline">Lihat Semua →</Link>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {recentUsers.map((u) => (
            <div key={u.id} className="flex flex-col items-center p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-center transition-colors hover:bg-[#f0f4f8]">
              <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center text-[14px] font-bold mb-2">
                {(u.full_name || '?').substring(0, 2).toUpperCase()}
              </div>
              <div className="text-[13px] font-semibold text-[#222] truncate w-full">{u.full_name || 'User'}</div>
              <div className="text-[11px] text-[#888] truncate w-full mb-1.5">{u.email}</div>
              {roleBadge(u.role)}
            </div>
          ))}
          {recentUsers.length === 0 && <p className="col-span-5 text-[13px] text-[#999] text-center py-4">Belum ada pengguna.</p>}
        </div>
      </div>
    </>
  );
}
