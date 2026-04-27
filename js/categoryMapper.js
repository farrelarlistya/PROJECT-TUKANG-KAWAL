/**
 * categoryMapper.js — Modul pemetaan kategori
 * Memetakan kategori projek TukangKawal ke kategori NewsAPI.org
 */

const CATEGORY_MAP = {
    'semua': {
        apiCategory: 'general', query: '', badgeClass: 'bg-badge-politik', label: 'Semua', icon: '📰'
    },
    'politik': {
        apiCategory: 'general', query: 'politik OR pemerintah OR presiden OR DPR', badgeClass: 'bg-badge-politik', label: 'Politik', icon: '🏛️'
    },
    'kriminal': {
        apiCategory: 'general', query: 'kriminal OR polisi OR kejahatan', badgeClass: 'bg-badge-kriminal', label: 'Kriminal', icon: '🚔'
    },
    'lingkungan': {
        apiCategory: 'science', query: 'lingkungan OR bencana OR iklim', badgeClass: 'bg-badge-lingkungan', label: 'Lingkungan', icon: '🌿'
    },
    'hukum': {
        apiCategory: 'general', query: 'hukum OR pengadilan OR korupsi', badgeClass: 'bg-badge-hukum', label: 'Hukum', icon: '⚖️'
    },
    'ekonomi': {
        apiCategory: 'business', query: '', badgeClass: 'bg-badge-ekonomi', label: 'Ekonomi', icon: '💰'
    },
    'internasional': {
        apiCategory: 'general', query: 'internasional OR dunia OR global', badgeClass: 'bg-badge-internasional', label: 'Internasional', icon: '🌍'
    }
};

const NAVBAR_CATEGORIES = ['semua', 'politik', 'kriminal', 'lingkungan', 'hukum', 'ekonomi', 'internasional'];

function getCategoryConfig(slug) {
    const s = (slug || 'semua').toLowerCase().trim();
    return CATEGORY_MAP[s] || CATEGORY_MAP['semua'];
}

function getAllCategories() {
    return NAVBAR_CATEGORIES.map(slug => ({
        slug, label: CATEGORY_MAP[slug].label, icon: CATEGORY_MAP[slug].icon
    }));
}

function getBadgeClass(slug) { return getCategoryConfig(slug).badgeClass; }
function getCategoryLabel(slug) { return getCategoryConfig(slug).label; }

/** Deteksi kategori dari konten artikel (heuristic) */
function detectCategoryFromArticle(article) {
    const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
    const keywords = {
        'politik': ['politik', 'pemerintah', 'presiden', 'dpr', 'menteri', 'partai', 'pemilu'],
        'kriminal': ['polisi', 'kriminal', 'kejahatan', 'ditangkap', 'tersangka', 'narkoba'],
        'hukum': ['hukum', 'pengadilan', 'hakim', 'vonis', 'korupsi', 'kpk', 'sidang'],
        'lingkungan': ['lingkungan', 'bencana', 'banjir', 'gempa', 'iklim', 'polusi'],
        'ekonomi': ['ekonomi', 'bisnis', 'saham', 'ihsg', 'rupiah', 'inflasi', 'investasi'],
        'internasional': ['internasional', 'dunia', 'global', 'pbb', 'amerika', 'eropa']
    };
    let best = 'semua', high = 0;
    for (const [cat, words] of Object.entries(keywords)) {
        let score = words.filter(w => text.includes(w)).length;
        if (score > high) { high = score; best = cat; }
    }
    return best;
}

window.CategoryMapper = {
    getCategoryConfig, getAllCategories, getBadgeClass, getCategoryLabel,
    detectCategoryFromArticle, CATEGORY_MAP, NAVBAR_CATEGORIES
};
