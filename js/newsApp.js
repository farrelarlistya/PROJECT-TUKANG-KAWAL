/**
 * newsApp.js — Main controller/orchestrator
 * Menginisialisasi dan mengkoordinasikan semua modul untuk halaman index dan detail
 */

// ============================================
// STATE MANAGEMENT
// ============================================
const AppState = {
    currentCategory: 'semua',
    currentPage: 1,
    isLoading: false,
    totalResults: 0,
    allLoadedArticles: []
};

// ============================================
// UTILITY: Debounce
// ============================================
function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ============================================
// HOMEPAGE FUNCTIONS
// ============================================

/**
 * Inisialisasi halaman utama (index.html)
 */
async function initHomePage() {
    // Baca kategori dari URL params
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category') || 'semua';
    AppState.currentCategory = categoryFromUrl;

    // Render navbar kategori
    renderNavbarCategories();
    updateActiveCategory(categoryFromUrl);

    // Setup event listeners
    setupSearchListener();
    setupLoadMoreListener();

    // Tampilkan skeleton loading
    showHomeSkeletons();

    // Fetch dan render data
    await loadHomePageData(categoryFromUrl);
}

/**
 * Render kategori di navbar (header & section)
 */
function renderNavbarCategories() {
    const categories = window.CategoryMapper.getAllCategories();
    const headerNav = document.getElementById('header-category-nav');
    const sectionNav = document.getElementById('section-category-nav');

    // Exclude 'semua' dari header navbar, include di section
    const headerCats = categories.filter(c => c.slug !== 'semua');
    const sectionCats = categories;

    if (headerNav) {
        headerNav.innerHTML = headerCats.map(c => `
            <li><a href="?category=${c.slug}" data-category="${c.slug}" 
                   class="nav-category-link no-underline rounded-[5px] border-[rgb(220,220,220)] text-[rgb(86,86,86)] p-[5px] transition-all duration-200"
                   onclick="handleCategoryClick(event, '${c.slug}')">${c.label}</a></li>
        `).join('');
    }

    if (sectionNav) {
        sectionNav.innerHTML = sectionCats.map(c => `
            <li><a href="?category=${c.slug}" data-category="${c.slug}" 
                   class="nav-category-link no-underline rounded-[5px] border-[rgb(220,220,220)] text-[rgb(86,86,86)] p-[5px] transition-all duration-200"
                   onclick="handleCategoryClick(event, '${c.slug}')">${c.label}</a></li>
        `).join('');
    }
}

/**
 * Update visual state kategori aktif di navbar
 * @param {string} slug - Slug kategori aktif
 */
function updateActiveCategory(slug) {
    // Hapus semua active state
    document.querySelectorAll('.nav-category-link').forEach(link => {
        link.classList.remove('nav-category-active');
    });
    // Tambah active state ke yang sesuai
    document.querySelectorAll(`[data-category="${slug}"]`).forEach(link => {
        link.classList.add('nav-category-active');
    });
}

/**
 * Handle klik kategori di navbar
 * @param {Event} event - Click event
 * @param {string} slug - Slug kategori
 */
function handleCategoryClick(event, slug) {
    event.preventDefault();

    if (AppState.isLoading) return; // Prevent spam click

    AppState.currentCategory = slug;
    AppState.currentPage = 1;
    AppState.allLoadedArticles = [];

    // Update URL tanpa reload
    const newUrl = `${window.location.pathname}?category=${slug}`;
    window.history.pushState({ category: slug }, '', newUrl);

    // Update visual state
    updateActiveCategory(slug);

    // Show skeleton & fetch data
    showHomeSkeletons();
    loadHomePageData(slug);
}

/**
 * Tampilkan skeleton loading di semua section homepage
 */
function showHomeSkeletons() {
    const hotNewsContainer = document.getElementById('hot-news-container');
    const newsCardsContainer = document.getElementById('news-cards-container');
    const trendingContainer = document.getElementById('trending-container');

    if (hotNewsContainer) hotNewsContainer.innerHTML = window.ArticleRenderer.renderSkeletonHotNews();
    if (newsCardsContainer) newsCardsContainer.innerHTML = window.ArticleRenderer.renderSkeletonCards(6);
    if (trendingContainer) trendingContainer.innerHTML = window.ArticleRenderer.renderSkeletonTrending(5);
}

/**
 * Load semua data untuk homepage
 * @param {string} categorySlug - Slug kategori
 */
async function loadHomePageData(categorySlug) {
    if (AppState.isLoading) return;
    AppState.isLoading = true;

    const config = window.CategoryMapper.getCategoryConfig(categorySlug);

    try {
        // Fetch utama: top headlines untuk kategori
        const mainData = await window.NewsAPI.fetchTopHeadlines(
            config.apiCategory,
            config.query,
            1,
            20
        );

        const articles = mainData.articles;
        AppState.totalResults = mainData.totalResults;
        AppState.allLoadedArticles = articles;

        // --- Render Hot News (artikel pertama) ---
        const hotNewsContainer = document.getElementById('hot-news-container');
        if (hotNewsContainer && articles.length > 0) {
            hotNewsContainer.innerHTML = window.ArticleRenderer.renderHotNews(articles[0], categorySlug);
        } else if (hotNewsContainer) {
            hotNewsContainer.innerHTML = '';
        }

        // --- Render News Cards (artikel 2-7) ---
        const newsCardsContainer = document.getElementById('news-cards-container');
        if (newsCardsContainer) {
            const cardArticles = articles.slice(1, 7);
            if (cardArticles.length > 0) {
                newsCardsContainer.innerHTML = window.ArticleRenderer.renderNewsCards(cardArticles, categorySlug);
            } else {
                newsCardsContainer.innerHTML = window.ArticleRenderer.renderEmptyState();
            }
        }

        // --- Render Trending (artikel 7-12 atau re-use) ---
        const trendingContainer = document.getElementById('trending-container');
        if (trendingContainer) {
            const trendingArticles = articles.length > 7 ? articles.slice(7, 12) : articles.slice(0, 5);
            trendingContainer.innerHTML = window.ArticleRenderer.renderTrendingList(trendingArticles);
        }

        // --- Render Exclusive Cards ---
        const exclusiveContainer = document.getElementById('exclusive-container');
        if (exclusiveContainer) {
            // Fetch bisnis/politik untuk eksklusif jika kategori utama bukan bisnis
            try {
                const exclusiveData = await window.NewsAPI.fetchTopHeadlines('general', '', 1, 4);
                exclusiveContainer.innerHTML = window.ArticleRenderer.renderExclusiveCards(exclusiveData.articles);
            } catch {
                // Fallback: gunakan artikel dari data utama
                exclusiveContainer.innerHTML = window.ArticleRenderer.renderExclusiveCards(articles.slice(0, 2));
            }
        }

        // --- Update Ticker ---
        const tickerMarquee = document.getElementById('ticker-marquee');
        if (tickerMarquee) {
            tickerMarquee.textContent = window.ArticleRenderer.renderTickerText(articles);
        }

        // --- Update Load More button visibility ---
        updateLoadMoreVisibility(articles.length, mainData.totalResults);

    } catch (error) {
        console.error('[NewsApp] Error loading homepage:', error);

        const newsCardsContainer = document.getElementById('news-cards-container');
        if (newsCardsContainer) {
            newsCardsContainer.innerHTML = window.ArticleRenderer.renderErrorState(error.message);
        }

        // Bersihkan sections lain
        const hotNewsContainer = document.getElementById('hot-news-container');
        const trendingContainer = document.getElementById('trending-container');
        if (hotNewsContainer) hotNewsContainer.innerHTML = '';
        if (trendingContainer) trendingContainer.innerHTML = '';

    } finally {
        AppState.isLoading = false;
    }
}

/**
 * Handle tombol "Muat Lebih Banyak"
 */
async function handleLoadMore() {
    if (AppState.isLoading) return;

    const btn = document.getElementById('load-more-btn');
    if (btn) {
        btn.textContent = 'Memuat...';
        btn.disabled = true;
    }

    AppState.currentPage++;
    AppState.isLoading = true;

    const config = window.CategoryMapper.getCategoryConfig(AppState.currentCategory);

    try {
        const data = await window.NewsAPI.fetchTopHeadlines(
            config.apiCategory,
            config.query,
            AppState.currentPage,
            6
        );

        const newsCardsContainer = document.getElementById('news-cards-container');
        if (newsCardsContainer && data.articles.length > 0) {
            newsCardsContainer.insertAdjacentHTML('beforeend',
                window.ArticleRenderer.renderNewsCards(data.articles, AppState.currentCategory)
            );
            AppState.allLoadedArticles = AppState.allLoadedArticles.concat(data.articles);
        }

        updateLoadMoreVisibility(AppState.allLoadedArticles.length, data.totalResults);

    } catch (error) {
        console.error('[NewsApp] Error loading more:', error);
        AppState.currentPage--;
    } finally {
        AppState.isLoading = false;
        if (btn) {
            btn.textContent = 'Muat Lebih Banyak Berita';
            btn.disabled = false;
        }
    }
}

/**
 * Update visibility tombol Load More
 */
function updateLoadMoreVisibility(loaded, total) {
    const loadMoreSection = document.getElementById('load-more-section');
    if (loadMoreSection) {
        loadMoreSection.style.display = loaded < total ? 'block' : 'none';
    }
}

/**
 * Setup listener untuk search input
 */
function setupSearchListener() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    const debouncedSearch = debounce(async (query) => {
        if (!query || query.trim().length < 3) {
            // Kembali ke kategori aktif
            showHomeSkeletons();
            await loadHomePageData(AppState.currentCategory);
            return;
        }

        showHomeSkeletons();

        try {
            const data = await window.NewsAPI.searchNews(query, 1, 12);
            const newsCardsContainer = document.getElementById('news-cards-container');
            const hotNewsContainer = document.getElementById('hot-news-container');

            if (hotNewsContainer && data.articles.length > 0) {
                hotNewsContainer.innerHTML = window.ArticleRenderer.renderHotNews(data.articles[0], 'semua');
            } else if (hotNewsContainer) {
                hotNewsContainer.innerHTML = '';
            }

            if (newsCardsContainer) {
                const cardArticles = data.articles.slice(1);
                newsCardsContainer.innerHTML = cardArticles.length > 0
                    ? window.ArticleRenderer.renderNewsCards(cardArticles, 'semua')
                    : window.ArticleRenderer.renderEmptyState();
            }

            const loadMoreSection = document.getElementById('load-more-section');
            if (loadMoreSection) loadMoreSection.style.display = 'none';

        } catch (error) {
            const newsCardsContainer = document.getElementById('news-cards-container');
            if (newsCardsContainer) {
                newsCardsContainer.innerHTML = window.ArticleRenderer.renderErrorState(error.message);
            }
        }
    }, 500);

    searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
}

/**
 * Setup listener untuk tombol Load More
 */
function setupLoadMoreListener() {
    const btn = document.getElementById('load-more-btn');
    if (btn) {
        btn.addEventListener('click', handleLoadMore);
    }
}

// ============================================
// DETAIL PAGE FUNCTIONS
// ============================================

/**
 * Inisialisasi halaman detail artikel (detail-artikel.html)
 */
async function initDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    const categorySlug = urlParams.get('category') || 'semua';

    const container = document.getElementById('article-detail-container');
    if (!container) return;

    // Tampilkan loading
    container.innerHTML = `
        <div class="text-center py-20">
            <div class="inline-block w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
            <p class="mt-4 text-[#777]">Memuat artikel...</p>
        </div>
    `;

    try {
        // Coba ambil artikel dari sessionStorage
        let article = null;
        if (articleId) {
            const storageKey = `article_${articleId}`;
            const stored = sessionStorage.getItem(storageKey);
            if (stored) {
                article = JSON.parse(stored);
            }
        }

        if (!article) {
            // Jika tidak ada di sessionStorage, tampilkan error
            container.innerHTML = window.ArticleRenderer.renderArticleDetail(null);
            return;
        }

        // Render detail artikel
        container.innerHTML = window.ArticleRenderer.renderArticleDetail(article, categorySlug);

        // Update title halaman
        document.title = `${article.title} | Tukang Kawal`;

        // Load related articles
        await loadRelatedArticles(categorySlug);

    } catch (error) {
        console.error('[NewsApp] Error loading detail:', error);
        container.innerHTML = window.ArticleRenderer.renderErrorState(error.message);
    }
}

/**
 * Load berita terkait untuk halaman detail
 * @param {string} currentCategory - Kategori artikel saat ini
 */
async function loadRelatedArticles(currentCategory) {
    const grid = document.getElementById('related-articles-grid');
    if (!grid) return;

    // Fetch dari beberapa kategori
    const categoriesToFetch = ['politik', 'kriminal', 'lingkungan', 'ekonomi']
        .filter(c => c !== currentCategory)
        .slice(0, 4);

    // Jika current category bukan salah satu default, tambahkan
    if (!categoriesToFetch.includes(currentCategory) && currentCategory !== 'semua') {
        categoriesToFetch.unshift(currentCategory);
        categoriesToFetch.pop();
    }

    const results = {};

    try {
        // Fetch parallel per kategori
        const promises = categoriesToFetch.map(async (slug) => {
            const config = window.CategoryMapper.getCategoryConfig(slug);
            try {
                const data = await window.NewsAPI.fetchTopHeadlines(config.apiCategory, config.query, 1, 2);
                results[slug] = data.articles;
            } catch {
                results[slug] = [];
            }
        });

        await Promise.all(promises);
        grid.innerHTML = window.ArticleRenderer.renderRelatedArticlesGrid(results);

    } catch (error) {
        grid.innerHTML = '<div class="col-span-4 text-center text-[#999] py-5">Gagal memuat berita terkait.</div>';
    }
}

// ============================================
// HANDLE BROWSER BACK/FORWARD
// ============================================
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.category) {
        AppState.currentCategory = event.state.category;
        AppState.currentPage = 1;
        updateActiveCategory(event.state.category);
        showHomeSkeletons();
        loadHomePageData(event.state.category);
    }
});

// ============================================
// AUTO-INIT BASED ON PAGE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
        initHomePage();
    } else if (currentPage === 'detail-artikel.html' || currentPage === 'detail-artikel') {
        initDetailPage();
    }
});

// Expose ke global scope (untuk onclick handlers di HTML)
window.handleCategoryClick = handleCategoryClick;
window.handleLoadMore = handleLoadMore;
