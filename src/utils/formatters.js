/**
 * formatters.js — Utilitas formatting tanggal, teks, gambar
 */

/**
 * Format waktu relatif ("3 jam yang lalu", "2 hari yang lalu", dll)
 * @param {string} isoDate - Tanggal dalam format ISO 8601
 * @returns {string}
 */
export function timeAgo(isoDate) {
  if (!isoDate) return '';
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit yang lalu`;
  if (diffHour < 24) return `${diffHour} jam yang lalu`;
  if (diffDay < 7) return `${diffDay} hari yang lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Format tanggal lengkap: "Senin, 30 September 2024 | 14:30 WIB"
 * @param {string} isoDate
 * @returns {string}
 */
export function formatFullDate(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayName = days[date.getDay()];
  const datePart = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const timePart = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `${dayName}, ${datePart} | ${timePart} WIB`;
}

/**
 * Mendapatkan inisial dari nama author
 * @param {string} author
 * @returns {string}
 */
export function getAuthorInitials(author) {
  if (!author) return 'TK';
  const words = author.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return author.substring(0, 2).toUpperCase();
}

/**
 * Mendapatkan URL gambar yang aman (fallback jika tidak ada)
 * @param {string} imageUrl
 * @returns {string}
 */
export function getSafeImageUrl(imageUrl) {
  if (!imageUrl) return 'https://placehold.co/600x400/1a3fc7/white?text=Tukang+Kawal';
  return imageUrl;
}

/**
 * Gabungkan description + content dari artikel NewsAPI
 * @param {Object} article
 * @returns {string}
 */
export function getArticlePreview(article) {
  const desc = article.description || '';
  const cont = (article.content || '').replace(/\[\+\d+ chars\]$/, '').trim();
  return desc && !cont.startsWith(desc) ? `${desc}\n\n${cont}` : desc || cont;
}

/**
 * Potong teks dengan ellipsis
 * @param {string} text
 * @param {number} maxLen
 * @returns {string}
 */
export function truncateText(text, maxLen = 150) {
  if (!text || text.length <= maxLen) return text || '';
  return text.substring(0, maxLen).trim() + '...';
}

/**
 * Buat hash ID dari artikel
 * @param {Object} article
 * @returns {string}
 */
export function createArticleId(article) {
  let hash = 0;
  const str = article.url || article.title || '';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'art_' + Math.abs(hash).toString(36);
}
