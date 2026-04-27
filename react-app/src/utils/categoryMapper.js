/**
 * categoryMapper.js — Pemetaan kategori untuk NewsAPI
 */
import { CATEGORIES } from './constants';

const CATEGORY_MAP = {};
CATEGORIES.forEach(c => { CATEGORY_MAP[c.slug] = c; });

/**
 * Mendapatkan konfigurasi kategori berdasarkan slug
 * @param {string} slug
 * @returns {Object}
 */
export function getCategoryConfig(slug) {
  const s = (slug || 'semua').toLowerCase().trim();
  return CATEGORY_MAP[s] || CATEGORY_MAP['semua'];
}

/**
 * Mendapatkan semua kategori untuk navbar (tanpa 'semua' dan 'eksklusif')
 * @returns {Array}
 */
export function getNavbarCategories() {
  return CATEGORIES.filter(c => c.slug !== 'semua' && c.slug !== 'eksklusif');
}

/**
 * Mendapatkan semua kategori termasuk 'semua'
 * @returns {Array}
 */
export function getAllCategories() {
  return CATEGORIES.filter(c => c.slug !== 'eksklusif');
}

/**
 * Mendapatkan badge class dari slug
 * @param {string} slug
 * @returns {string}
 */
export function getBadgeClass(slug) {
  return getCategoryConfig(slug).badgeClass;
}

/**
 * Mendapatkan label kategori dari slug
 * @param {string} slug
 * @returns {string}
 */
export function getCategoryLabel(slug) {
  return getCategoryConfig(slug).label;
}

/** Keyword map untuk deteksi kategori heuristic */
const KEYWORD_MAP = {
  business: ['business', 'economy', 'market', 'stock', 'trade', 'finance', 'invest', 'bank', 'company'],
  entertainment: ['movie', 'film', 'music', 'celebrity', 'actor', 'singer', 'award', 'show', 'netflix', 'disney'],
  health: ['health', 'medical', 'doctor', 'hospital', 'vaccine', 'disease', 'pandemic', 'mental', 'drug'],
  science: ['science', 'nasa', 'space', 'research', 'study', 'climate', 'biology', 'physics'],
  sports: ['sport', 'game', 'team', 'player', 'match', 'league', 'nba', 'nfl', 'soccer', 'football'],
  technology: ['tech', 'ai', 'software', 'app', 'google', 'apple', 'microsoft', 'data', 'robot', 'cyber'],
};

/**
 * Deteksi kategori dari konten artikel (heuristic)
 * @param {Object} article
 * @returns {string}
 */
export function detectCategoryFromArticle(article) {
  const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
  let best = 'semua';
  let high = 0;
  for (const [cat, words] of Object.entries(KEYWORD_MAP)) {
    const score = words.filter(w => text.includes(w)).length;
    if (score > high) { high = score; best = cat; }
  }
  return best;
}
