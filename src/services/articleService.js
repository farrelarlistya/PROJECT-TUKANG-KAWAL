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
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('article-covers')
      .upload(filePath, file, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

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
    const { data, error } = await supabase
      .from('articles')
      .insert([articleData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating article:', error);
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
