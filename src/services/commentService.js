/**
 * commentService.js — CRUD operasi untuk komentar artikel
 *
 * Semua query menggunakan Supabase client singleton.
 */
import { supabase } from './supabaseClient';

/**
 * Ambil semua komentar untuk sebuah artikel (by article_id).
 * Sudah di-join dengan profiles untuk mendapatkan nama & avatar.
 * Urutkan dari terbaru.
 */
export async function getCommentsByArticle(articleId) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      updated_at,
      user_id,
      parent_id,
      profiles (
        id,
        full_name,
        username,
        initials,
        avatar_url
      )
    `)
    .eq('article_id', articleId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[Comments] Gagal memuat komentar:', error.message);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Tambah komentar baru
 */
export async function addComment({ articleId, userId, content, parentId = null }) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      article_id: articleId,
      user_id: userId,
      content: content.trim(),
      parent_id: parentId,
    })
    .select(`
      id,
      content,
      created_at,
      updated_at,
      user_id,
      parent_id,
      profiles (
        id,
        full_name,
        username,
        initials,
        avatar_url
      )
    `)
    .single();

  if (error) {
    console.error('[Comments] Gagal menambah komentar:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Update komentar (hanya pemilik komentar)
 */
export async function updateComment(commentId, newContent) {
  const { data, error } = await supabase
    .from('comments')
    .update({
      content: newContent.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .select(`
      id,
      content,
      created_at,
      updated_at,
      user_id,
      parent_id,
      profiles (
        id,
        full_name,
        username,
        initials,
        avatar_url
      )
    `)
    .single();

  if (error) {
    console.error('[Comments] Gagal mengupdate komentar:', error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Hapus komentar (hanya pemilik komentar atau admin)
 */
export async function deleteComment(commentId) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('[Comments] Gagal menghapus komentar:', error.message);
    return { error };
  }

  return { error: null };
}
