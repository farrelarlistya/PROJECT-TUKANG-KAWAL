import { supabase } from './supabaseClient';

/**
 * Fetch published articles, optionally filtered by category
 */
export async function getPublishedArticles({ category = 'general', page = 1, limit = 20, isExclusive = false }) {
  try {
    let query = supabase
      .from('articles')
      .select(`
        *,
        profiles!author_id ( full_name, initials, avatar_url ),
        categories!category_id ( slug, label, icon, badge_class )
      `, { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    // Filter by exclusive
    query = query.eq('is_exclusive', isExclusive);

    // Filter by category if not 'general'
    if (category && category !== 'general') {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      }
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      articles: data || [],
      totalResults: count || 0
    };
  } catch (error) {
    console.error('Error in getPublishedArticles:', error);
    throw error;
  }
}

/**
 * Search published articles
 */
export async function searchArticles(searchQuery, { page = 1, limit = 12 }) {
  try {
    if (!searchQuery || searchQuery.trim() === '') {
      return { articles: [], totalResults: 0 };
    }

    // Prepare search term
    const term = `%${searchQuery.trim()}%`;

    let query = supabase
      .from('articles')
      .select(`
        *,
        profiles!author_id ( full_name, initials, avatar_url ),
        categories!category_id ( slug, label, icon, badge_class )
      `, { count: 'exact' })
      .eq('status', 'published')
      .or(`title.ilike.${term},description.ilike.${term}`)
      .order('published_at', { ascending: false });

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      articles: data || [],
      totalResults: count || 0
    };
  } catch (error) {
    console.error('Error in searchArticles:', error);
    throw error;
  }
}

/**
 * Fetch a single article by its slug
 */
export async function getArticleBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        profiles!author_id ( full_name, initials, avatar_url ),
        categories!category_id ( slug, label, icon, badge_class )
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in getArticleBySlug:', error);
    throw error;
  }
}

/**
 * Upload cover image to Supabase Storage
 */
export async function uploadArticleCover(file, userId) {
  // Validasi ukuran file (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('Ukuran file terlalu besar. Maksimal 5MB.');
  }

  // Validasi tipe file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format file tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF.');
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload dengan timeout 30 detik
    const uploadPromise = supabase.storage
      .from('article-covers')
      .upload(filePath, file, { contentType: file.type, upsert: false });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Upload timeout. Periksa koneksi internet Anda.')), 30000)
    );

    const { error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

    if (uploadError) throw new Error('Gagal upload gambar: ' + uploadError.message);

    const { data } = supabase.storage
      .from('article-covers')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading cover:', error);
    throw error;
  }
}

/**
 * Create a new article
 */
export async function createArticle(articleData) {
  try {
    // Sanitasi data sebelum insert
    const sanitizedData = { ...articleData };

    // Pastikan tags dalam format yang benar untuk PostgreSQL array
    // Jika tags undefined/null, kirim array kosong
    if (sanitizedData.tags === undefined || sanitizedData.tags === null) {
      sanitizedData.tags = [];
    }
    // Jika tags bukan array, konversi
    if (!Array.isArray(sanitizedData.tags)) {
      sanitizedData.tags = String(sanitizedData.tags).split(',').map(t => t.trim()).filter(Boolean);
    }
    // Filter tag kosong
    sanitizedData.tags = sanitizedData.tags.filter(t => t && t.trim() !== '');

    // Pastikan field wajib ada
    if (!sanitizedData.title || !sanitizedData.content) {
      throw new Error('Judul dan konten artikel wajib diisi.');
    }
    if (!sanitizedData.slug) {
      throw new Error('Slug artikel tidak boleh kosong.');
    }
    if (!sanitizedData.author_id) {
      throw new Error('Author ID tidak ditemukan. Pastikan Anda sudah login.');
    }

    console.log('[ArticleService] Mengirim artikel:', {
      title: sanitizedData.title,
      slug: sanitizedData.slug,
      status: sanitizedData.status,
      category_id: sanitizedData.category_id,
      tags: sanitizedData.tags,
      has_cover: !!sanitizedData.cover_image_url
    });

    // Insert dengan timeout 15 detik untuk mencegah hang
    const insertPromise = supabase
      .from('articles')
      .insert([sanitizedData])
      .select();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: Server tidak merespons dalam 15 detik. Coba lagi.')), 15000)
    );

    const { data, error } = await Promise.race([insertPromise, timeoutPromise]);

    if (error) {
      console.error('[ArticleService] Supabase insert error:', error);
      // Berikan pesan error yang lebih jelas
      if (error.code === '23505') {
        throw new Error('Artikel dengan slug yang sama sudah ada. Coba ubah judul.');
      }
      if (error.code === '23503') {
        throw new Error('Kategori atau author tidak valid. Pastikan data benar.');
      }
      if (error.code === '42501') {
        throw new Error('Anda tidak memiliki izin untuk membuat artikel. Periksa RLS policy di Supabase.');
      }
      throw new Error(error.message || 'Gagal menyimpan artikel ke database.');
    }

    console.log('[ArticleService] Artikel berhasil disimpan:', data);

    // Deteksi RLS silent failure: data null/kosong tanpa error
    // berarti RLS memblokir insert tanpa memberikan error eksplisit
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.error('[ArticleService] RLS silent failure: insert berhasil tanpa error tapi data kosong');
      throw new Error('Gagal menyimpan artikel. Kemungkinan Anda tidak memiliki izin (RLS policy). Hubungi admin.');
    }

    return { ...sanitizedData, success: true };
  } catch (error) {
    console.error('[ArticleService] Error creating article:', error);
    throw error;
  }
}

/**
 * Update an existing article
 */
export async function updateArticle(articleId, updates) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', articleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
}

/**
 * Fetch all pending articles (for admin review)
 */
export async function getPendingArticles() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        profiles!author_id ( full_name, initials, avatar_url ),
        categories!category_id ( slug, label, icon, badge_class )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getPendingArticles:', error);
    throw error;
  }
}

/**
 * Fetch all articles for admin (all statuses)
 */
export async function getAllArticlesForAdmin() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        profiles!author_id ( full_name, initials, avatar_url ),
        categories!category_id ( slug, label, icon, badge_class )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getAllArticlesForAdmin:', error);
    throw error;
  }
}

/**
 * Approve an article (set status to published)
 */
export async function approveArticle(articleId) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', articleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in approveArticle:', error);
    throw error;
  }
}

/**
 * Reject an article
 */
export async function rejectArticle(articleId) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', articleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in rejectArticle:', error);
    throw error;
  }
}

/**
 * Delete an article
 */
export async function deleteArticle(articleId, coverUrl = null) {
  try {
    // Optionally delete cover from storage if exists
    if (coverUrl && coverUrl.includes('article-covers')) {
      const pathParts = coverUrl.split('article-covers/');
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        await supabase.storage.from('article-covers').remove([filePath]);
      }
    }

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
}
