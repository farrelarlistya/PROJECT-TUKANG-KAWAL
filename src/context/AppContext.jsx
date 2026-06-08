/**
 * AppContext.jsx — Global state: Supabase Auth + Toast notifications
 *
 * Refactored: Dummy localStorage auth → Supabase Auth real
 * Interface useAuth() TETAP SAMA agar komponen lain tidak perlu berubah.
 */
import { createContext, useState, useEffect, useCallback, useContext, useReducer } from 'react';
import { USER_ROLES } from '@/utils/constants';
import { supabase } from '@/services/supabaseClient';
import { getProfile, updateProfile, upgradeToMember as upgradeProfileRole } from '@/services/profileService';

// --- Contexts ---
const AuthContext = createContext(null);
const ToastContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // loading awal saat cek session
  const [toasts, setToasts] = useReducer(toastReducer, []);

  // ─── Auth State Listener ────────────────────────────────────
  // Supabase otomatis refresh session & token. Kita cukup dengarkan event-nya.
  useEffect(() => {
    // Test koneksi ke Supabase
    console.log('[Supabase] Mengetes koneksi...');
    supabase.from('profiles').select('id', { count: 'exact', head: true }).limit(1)
      .then(({ error }) => {
        if (error) console.error('[Supabase] Tes koneksi gagal:', error.message);
        else console.log('[Supabase] Tes koneksi berhasil!');
      })
      .catch(err => console.error('[Supabase] Tes koneksi error:', err));

    // 1. Cek session yang sudah ada (misal user reload halaman)
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (!currentSession) {
        setLoading(false);
      }
    });

    // 2. Dengarkan perubahan auth (login, logout, token refresh)
    // Supabase Auth listener harus tetap sinkron untuk mencegah deadlock/loop saat tab fokus kembali (Alt-Tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    );

    // Cleanup listener saat unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 3. Efek terpisah untuk memuat profil asinkron saat ID user sesi berubah
  useEffect(() => {
    if (session?.user?.id) {
      fetchAndSetProfile(session.user.id);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [session?.user?.id]);

  /**
   * Fetch profile dari tabel profiles dan set ke state
   */
  async function fetchAndSetProfile(userId) {
    try {
      const { data: profile, error } = await getProfile(userId);
      if (error) {
        console.error('[Auth] Gagal fetch profile:', error.message);
        setUser(null);
        setIsAuthenticated(false);
      } else if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          username: profile.username,
          fullName: profile.full_name,
          initials: profile.initials,
          role: profile.role,
          avatarUrl: profile.avatar_url,
          phoneWa: profile.phone_wa || '',
          birthDate: profile.birth_date || '',
          city: profile.city || '',
        });
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('[Auth] Error fetch profile:', err);
    } finally {
      setLoading(false);
    }
  }

  // ─── Login ──────────────────────────────────────────────────
  const login = useCallback(async (identifier, password) => {
    try {
      // Supabase Auth menggunakan email untuk login.
      // Jika user memasukkan username, kita perlu cari email-nya dulu.
      let email = identifier;

      // Cek apakah identifier adalah email (mengandung @)
      if (!identifier.includes('@')) {
        // Cari email berdasarkan username dari tabel profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', identifier)
          .maybeSingle();

        if (profileError || !profile) {
          return { success: false, error: 'Username tidak ditemukan.' };
        }
        email = profile.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: 'Email/Username atau Password salah.' };
      }

      // Fetch profile untuk dapat role dan data lengkap
      const { data: profile, error: profileError } = await getProfile(data.user.id);

      if (profileError || !profile) {
        console.warn('[Auth] Profile tidak ditemukan setelah login, menggunakan data fallback.');
        const fallbackData = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'user',
          fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          initials: 'U',
          role: USER_ROLES.USER,
          avatarUrl: null,
        };
        setUser(fallbackData);
        setIsAuthenticated(true);
        return { success: true, user: fallbackData };
      }

      const userData = {
        id: profile.id,
        email: profile.email,
        username: profile.username,
        fullName: profile.full_name,
        initials: profile.initials || 'U',
        role: profile.role || USER_ROLES.USER,
        avatarUrl: profile.avatar_url,
        phoneWa: profile.phone_wa || '',
        birthDate: profile.birth_date || '',
        city: profile.city || '',
      };

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (err) {
      console.error('[Auth] Login error:', err);
      return { success: false, error: 'Terjadi kesalahan saat login. Pastikan koneksi internet stabil.' };
    }
  }, []);

  // ─── Register ───────────────────────────────────────────────
  const register = useCallback(async (fullName, username, email, password) => {
    try {
      console.log('[Auth] Memulai registrasi untuk:', email);

      // 1. Cek username
      console.log('[Auth] Mengecek username:', username);
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      console.log('[Auth] Hasil cek username:', { existing, checkError });

      if (checkError) {
        console.error('[Auth] Error saat cek username:', checkError);
      }

      if (existing) {
        console.log('[Auth] Username sudah terpakai');
        return { success: false, error: 'Username sudah digunakan.' };
      }

      // 2. SignUp
      console.log('[Auth] Melakukan signUp...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        console.error('[Auth] SignUp error:', signUpError);
        if (signUpError.message.includes('already registered')) {
          return { success: false, error: 'Email sudah terdaftar.' };
        }
        return { success: false, error: signUpError.message };
      }

      console.log('[Auth] SignUp berhasil, membersihkan sesi...');

      // 3. SignOut (untuk memastikan tidak langsung login)
      // Gunakan catch agar jika signOut gagal tidak menghentikan flow sukses register
      await supabase.auth.signOut().catch(err => console.warn('[Auth] SignOut setelah register gagal:', err));

      return { success: true };
    } catch (err) {
      console.error('[Auth] Register unexpected error:', err);
      return { success: false, error: 'Terjadi kesalahan sistem saat mendaftar.' };
    }
  }, []);

  // ─── Logout ─────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      // SignOut dari Supabase secara global
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('[Auth] Server signout peringatan:', error.message);
      }
    } catch (err) {
      console.error('[Auth] Logout error:', err);
    } finally {
      // Pastikan state lokal tetap dibersihkan
      setUser(null);
      setIsAuthenticated(false);
      setSession(null);

      // FIX: Bersihkan kunci sesi Supabase di localStorage secara paksa
      // Ini mengatasi bug di mana user Google tidak bisa logout
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
    }
  }, []);

  // ─── Update User Profile ───────────────────────────────────
  const updateUser = useCallback(async (updates) => {
    if (!user?.id) return;

    // Map dari format frontend ke format database
    const dbUpdates = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.username !== undefined) dbUpdates.username = updates.username;
    if (updates.initials !== undefined) dbUpdates.initials = updates.initials;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.phoneWa !== undefined) dbUpdates.phone_wa = updates.phoneWa;
    if (updates.birthDate !== undefined) dbUpdates.birth_date = updates.birthDate;
    if (updates.city !== undefined) dbUpdates.city = updates.city;

    const { data: updated, error } = await updateProfile(user.id, dbUpdates);
    if (!error && updated) {
      setUser(prev => ({
        ...prev,
        ...updates,
      }));
    }
  }, [user]);

  // ─── Update Password ───────────────────────────────────────
  const updatePassword = useCallback(async (oldPassword, newPassword) => {
    try {
      // Supabase tidak memerlukan old password untuk update,
      // tapi kita verifikasi dulu dengan re-login untuk keamanan
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email,
        password: oldPassword,
      });

      if (verifyError) {
        return { success: false, error: 'Kata sandi lama salah!' };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('[Auth] Update password error:', err);
      return { success: false, error: 'Gagal mengubah kata sandi.' };
    }
  }, [user]);

  // ─── Delete Account ─────────────────────────────────────────
  const deleteAccount = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Hapus profil dari tabel profiles (cascade akan membersihkan relasi)
      await supabase.from('profiles').delete().eq('id', user.id);

      // Logout setelah hapus
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('[Auth] Delete account error:', err);
    }
  }, [user]);

  // ─── Upgrade to Member ──────────────────────────────────────
  // Alur baru: checkout hanya membuat data langganan berstatus 'pending'.
  // Role user baru akan diaktifkan oleh admin melalui persetujuan di dashboard.
  const upgradeToMember = useCallback(async (plan = '1tahun', paymentMethod = 'bca', amount = 411600, virtualAccount = '') => {
    if (!user?.id) return;

    const startsAt = new Date();
    const expiresAt = new Date();
    if (plan === '1bulan') {
      expiresAt.setDate(expiresAt.getDate() + 30);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 365);
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan: plan,
        payment_method: paymentMethod,
        amount: amount,
        status: 'pending', // Awalnya berstatus pending menunggu konfirmasi admin
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        virtual_account: virtualAccount || null,
        confirmed_at: null // Belum dikonfirmasi oleh admin
      })
      .select()
      .single();

    if (error) {
      console.error('[upgradeToMember] Gagal membuat langganan pending:', error);
      throw error;
    }

    return data;
  }, [user]);

  // ─── Toast Functions ────────────────────────────────────────
  const addToast = useCallback((message, type = 'info') => {
    setToasts({ type: 'ADD', payload: { id: Date.now(), message, type } });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts({ type: 'REMOVE', payload: id });
  }, []);

  // ─── Derived State ──────────────────────────────────────────
  const isMember = user?.role === USER_ROLES.MEMBER || user?.role === USER_ROLES.ADMIN;
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isMember,
      isAdmin,
      loading,
      login,
      register,
      logout,
      updateUser,
      updatePassword,
      deleteAccount,
      upgradeToMember,
    }}>
      <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
        {children}
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}

// ─── Toast Reducer ────────────────────────────────────────────
function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload];
    case 'REMOVE':
      return state.filter(t => t.id !== action.payload);
    default:
      return state;
  }
}

// ─── Hooks (interface TETAP SAMA) ─────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AppProvider');
  return context;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within AppProvider');
  return context;
}
