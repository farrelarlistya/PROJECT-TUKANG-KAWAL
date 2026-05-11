/**
 * profileService.js — CRUD operasi untuk tabel profiles di Supabase
 */
import { supabase } from './supabaseClient';

/**
 * Mengambil profil user berdasarkan ID (auth.uid)
 * @param {string} userId
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

/**
 * Update profil user (nama, avatar, dll)
 * @param {string} userId
 * @param {Object} updates - Kolom yang ingin diupdate
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

/**
 * Upload avatar ke Supabase Storage lalu update profil
 * @param {string} userId
 * @param {File} file
 * @returns {Promise<{url: string|null, error: Object|null}>}
 */
export async function uploadAvatar(userId, file) {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  // Upload (upsert = overwrite jika sudah ada)
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true, contentType: file.type });

  if (uploadError) return { url: null, error: uploadError };

  // Ambil public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const avatarUrl = urlData.publicUrl;

  // Update profil dengan URL avatar baru
  await updateProfile(userId, { avatar_url: avatarUrl });

  return { url: avatarUrl, error: null };
}

/**
 * Upgrade role user ke 'member'
 * @param {string} userId
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function upgradeToMember(userId) {
  return updateProfile(userId, { role: 'member' });
}
