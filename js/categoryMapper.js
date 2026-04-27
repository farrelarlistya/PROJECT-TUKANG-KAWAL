/**
 * categoryMapper.js — Modul pemetaan kategori
 * Menggunakan kategori resmi dari NewsAPI.org secara langsung
 */

const CATEGORY_MAP = {
    'semua': {
        apiCategory: 'general', query: '', badgeClass: 'bg-badge-general', label: 'Semua', icon: '📰'
    },
    'business': {
        apiCategory: 'business', query: '', badgeClass: 'bg-badge-business', label: 'Business', icon: '💼'
    },
    'entertainment': {
        apiCategory: 'entertainment', query: '', badgeClass: 'bg-badge-entertainment', label: 'Entertainment', icon: '🎬'
    },
    'health': {
        apiCategory: 'health', query: '', badgeClass: 'bg-badge-health', label: 'Health', icon: '🏥'
    },
    'science': {
        apiCategory: 'science', query: '', badgeClass: 'bg-badge-science', label: 'Science', icon: '🔬'
    },
    'sports': {
        apiCategory: 'sports', query: '', badgeClass: 'bg-badge-sports', label: 'Sports', icon: '⚽'
    },
    'technology': {
        apiCategory: 'technology', query: '', badgeClass: 'bg-badge-technology', label: 'Technology', icon: '💻'
    },
    'eksklusif': {
        apiCategory: 'general', query: '', badgeClass: 'bg-badge-eksklusif', label: 'Eksklusif', icon: '🔒'
    }
};

const NAVBAR_CATEGORIES = ['semua', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'];

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
        'business': ['business', 'economy', 'market', 'stock', 'trade', 'finance', 'invest', 'bank', 'company'],
        'entertainment': ['movie', 'film', 'music', 'celebrity', 'actor', 'singer', 'award', 'show', 'netflix', 'disney'],
        'health': ['health', 'medical', 'doctor', 'hospital', 'vaccine', 'disease', 'pandemic', 'mental', 'drug'],
        'science': ['science', 'nasa', 'space', 'research', 'study', 'climate', 'biology', 'physics'],
        'sports': ['sport', 'game', 'team', 'player', 'match', 'league', 'nba', 'nfl', 'soccer', 'football'],
        'technology': ['tech', 'ai', 'software', 'app', 'google', 'apple', 'microsoft', 'data', 'robot', 'cyber']
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
