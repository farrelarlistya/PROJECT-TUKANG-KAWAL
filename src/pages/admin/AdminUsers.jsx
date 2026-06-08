import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabaseClient';
import { useToast } from '@/context/AppContext';

export default function AdminUsers() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      addToast('Gagal memuat data pengguna: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleChangeRole = async (userId, newRole, oldRole) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      // Jika diubah ke member, buat record subscription otomatis
      if (newRole === 'member' && oldRole !== 'member') {
        const startsAt = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 365); // default 1 tahun

        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan: '1tahun',
            payment_method: 'admin',
            amount: 0,
            status: 'active',
            starts_at: startsAt.toISOString(),
            expires_at: expiresAt.toISOString(),
            virtual_account: 'ADMIN-GRANT',
            confirmed_at: new Date().toISOString()
          });

        if (subError) {
          console.warn('Gagal membuat record subscription:', subError);
        }
      }

      addToast(`Role pengguna berhasil diubah ke ${newRole}`, 'success');
      await fetchUsers();
    } catch (err) {
      addToast('Gagal mengubah role: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId, email) => {
    if (!window.confirm(`Hapus pengguna ${email}? Tindakan ini tidak bisa dibatalkan.`)) return;
    setActionLoading(userId);
    try {
      // Delete profile (cascade will handle articles etc.)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      addToast('Pengguna berhasil dihapus.', 'success');
      await fetchUsers();
    } catch (err) {
      addToast('Gagal menghapus pengguna: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  const roleBadge = (role) => {
    const map = {
      admin: { bg: '#ede9fe', color: '#5b21b6', label: 'Admin' },
      member: { bg: '#dbeafe', color: '#1e40af', label: 'Member' },
      'non-member': { bg: '#f3f4f6', color: '#374151', label: 'Non-Member' },
    };
    const r = map[role] || map['non-member'];
    return <span style={{ background: r.bg, color: r.color }} className="py-1 px-2.5 rounded text-[11px] font-semibold">{r.label}</span>;
  };

  // Filter & Search
  const filtered = users.filter(u => {
    const matchSearch = !search || 
      u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleCounts = {
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    member: users.filter(u => u.role === 'member').length,
    'non-member': users.filter(u => u.role === 'non-member').length,
  };

  return (
    <>
      <div className="mb-1">
        <h1 className="text-[22px] font-bold text-navy">Kelola Pengguna</h1>
        <p className="text-[13.5px] text-[#888] mt-1">
          Daftar semua pengguna terdaftar
          <span className="ml-2 bg-[#f3f4f6] text-[#374151] py-0.5 px-2 rounded-full text-[12px] font-semibold">
            {users.length} pengguna
          </span>
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Cari nama, email, atau username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[250px] py-2.5 px-4 border border-[#dcdcdc] rounded-lg text-[13px] outline-none bg-white focus:border-brand focus:shadow-[0_0_0_3px_rgba(26,63,199,0.1)] transition-all"
        />
        <div className="flex gap-1.5">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'admin', label: 'Admin' },
            { key: 'member', label: 'Member' },
            { key: 'non-member', label: 'Non-Member' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterRole(f.key)}
              className={`py-2 px-3.5 rounded-lg text-[12px] font-semibold border cursor-pointer transition-all duration-200 ${filterRole === f.key
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-[#555] border-[#dcdcdc] hover:bg-[#f5f5f5]'
              }`}
            >
              {f.label} ({roleCounts[f.key]})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#dcdcdc] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            <span className="ml-3 text-[14px] text-[#777]">Memuat pengguna...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-3 text-[#cbd5e1]">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-[#333] mb-1">
              {search ? 'Tidak ada hasil pencarian' : 'Belum ada pengguna'}
            </p>
            <p className="text-[13px] text-[#888]">
              {search ? 'Coba kata kunci lain.' : 'Pengguna akan muncul setelah mendaftar.'}
            </p>
          </div>
        ) : (
          <table className="data-table w-full border-collapse">
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Bergabung</th>
                <th>Ubah Role</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isProcessing = actionLoading === u.id;
                return (
                  <tr key={u.id} className={isProcessing ? 'opacity-50 pointer-events-none' : ''}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-[12px] font-bold shrink-0 overflow-hidden">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            u.initials || '?'
                          )}
                        </div>
                        <span className="font-semibold text-[13.5px]">{u.full_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="text-[13px] text-[#555]">{u.email}</td>
                    <td className="text-[13px] text-[#555]">@{u.username}</td>
                    <td>{roleBadge(u.role)}</td>
                    <td className="text-[13px] whitespace-nowrap">{formatDate(u.created_at)}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value, u.role)}
                        disabled={isProcessing}
                        className="py-1.5 px-2 border border-[#dcdcdc] rounded text-[12px] bg-white cursor-pointer outline-none focus:border-brand"
                      >
                        <option value="non-member">Non-Member</option>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(u.id, u.email)}
                        disabled={isProcessing || u.role === 'admin'}
                        className="bg-[#dc2626] text-white py-1.5 px-3 rounded text-[12px] font-semibold border-none cursor-pointer hover:bg-[#b91c1c] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={u.role === 'admin' ? 'Tidak bisa menghapus admin' : 'Hapus pengguna'}
                      >
                        Hapus
                      </button>
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
