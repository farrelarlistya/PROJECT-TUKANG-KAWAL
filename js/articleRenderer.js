/**
 * articleRenderer.js — Modul render UI artikel
 * Bertanggung jawab untuk merender semua komponen berita secara dinamis
 */

/**
 * Format waktu relatif ("3 jam yang lalu", "2 hari yang lalu", dll)
 * @param {string} isoDate - Tanggal dalam format ISO 8601
 * @returns {string} Waktu relatif dalam bahasa Indonesia
 */
function timeAgo(isoDate) {
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
 * Format tanggal lengkap untuk halaman detail
 * @param {string} isoDate - Tanggal ISO
 * @returns {string} Format: "Senin, 30 September 2024 | 14:30 WIB"
 */
function formatFullDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[date.getDay()];
    const datePart = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const timePart = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${dayName}, ${datePart} | ${timePart} WIB`;
}

/**
 * Membuat URL ke halaman detail artikel
 * Data artikel disimpan di sessionStorage dan navigasi via query param
 * @param {Object} article - Objek artikel dari NewsAPI
 * @param {string} categorySlug - Slug kategori
 * @returns {string} URL ke detail-artikel.html
 */
function createArticleUrl(article, categorySlug) {
    // Buat hash sederhana dari URL artikel untuk ID unik yang pendek
    let hash = 0;
    const str = article.url || article.title || '';
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    const id = 'art_' + Math.abs(hash).toString(36);
    // Simpan artikel ke sessionStorage agar bisa diakses di halaman detail
    const storageKey = `article_${id}`;
    const dataToStore = { ...article, _category: categorySlug };
    sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
    return `detail-artikel.html?id=${encodeURIComponent(id)}&category=${encodeURIComponent(categorySlug)}`;
}

/**
 * Mendapatkan inisial dari nama author
 * @param {string} author - Nama author
 * @returns {string} 2 karakter inisial
 */
function getAuthorInitials(author) {
    if (!author) return 'TK';
    const words = author.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return author.substring(0, 2).toUpperCase();
}

/**
 * Mendapatkan URL gambar yang aman (fallback jika tidak ada)
 * @param {string} imageUrl - URL gambar dari API
 * @returns {string} URL gambar yang valid
 */
function getSafeImageUrl(imageUrl) {
    if (!imageUrl) return 'https://placehold.co/600x400/1a3fc7/white?text=Tukang+Kawal';
    return imageUrl;
}

// ============================================
// RENDER FUNCTIONS
// ============================================

/**
 * Render Hot News (hero section di bagian atas)
 * @param {Object} article - Artikel utama
 * @param {string} categorySlug - Slug kategori
 * @returns {string} HTML string
 */
function renderHotNews(article, categorySlug) {
    if (!article) return '';
    const detected = categorySlug || window.CategoryMapper.detectCategoryFromArticle(article);
    const badgeClass = window.CategoryMapper.getBadgeClass(detected);
    const label = window.CategoryMapper.getCategoryLabel(detected);
    const url = createArticleUrl(article, detected);

    return `
        <a href="${url}" class="hot-news flex gap-[50px] text-justify bg-white mx-[50px] my-5 no-underline text-black article-fade-in">
            <img src="${getSafeImageUrl(article.urlToImage)}" alt="${article.title}" class="w-[40vw] object-cover" loading="lazy"
                 onerror="this.src='https://placehold.co/600x400/1a3fc7/white?text=Tukang+Kawal'">
            <div class="pr-[30px] flex flex-col justify-center gap-5">
                <h2 class="text-[40px] tracking-[-2px] leading-[35px]">${article.title}</h2>
                <p class="pt-0 pr-[100px]">${article.description || ''}</p>
                <div class="flex gap-2.5 text-[13px] text-[#777]">
                    <span class="inline-block py-[3px] px-2.5 rounded-[4px] text-[11px] font-bold text-white uppercase ${badgeClass}">${label}</span>
                    <span>${timeAgo(article.publishedAt)}</span>
                </div>
            </div>
        </a>
    `;
}

/**
 * Render grid News Cards
 * @param {Array} articles - Array artikel
 * @param {string} categorySlug - Slug kategori aktif
 * @returns {string} HTML string
 */
function renderNewsCards(articles, categorySlug) {
    if (!articles || articles.length === 0) return renderEmptyState();

    return articles.map(article => {
        const detected = categorySlug && categorySlug !== 'semua'
            ? categorySlug
            : window.CategoryMapper.detectCategoryFromArticle(article);
        const badgeClass = window.CategoryMapper.getBadgeClass(detected);
        const label = window.CategoryMapper.getCategoryLabel(detected);
        const url = createArticleUrl(article, detected);

        return `
            <a href="${url}" class="news-card block bg-white rounded-lg overflow-hidden transition-all duration-300 no-underline text-inherit cursor-pointer hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:-translate-y-[3px] article-fade-in">
                <img src="${getSafeImageUrl(article.urlToImage)}" alt="${article.title}" loading="lazy"
                     onerror="this.src='https://placehold.co/400x200/1a3fc7/white?text=Tukang+Kawal'">
                <div class="news-card-body p-[15px]">
                    <span class="inline-block py-[3px] px-2.5 rounded-[4px] text-[11px] font-bold text-white uppercase mb-2 ${badgeClass}">${label}</span>
                    <h3>${article.title}</h3>
                    <p>${article.description || ''}</p>
                    <div class="flex gap-2.5 text-[12px] text-[#999]">
                        <span>${timeAgo(article.publishedAt)}</span>
                        ${article.source?.name ? `<span>• ${article.source.name}</span>` : ''}
                    </div>
                </div>
            </a>
        `;
    }).join('');
}

/**
 * Render daftar trending
 * @param {Array} articles - Array artikel (max 5)
 * @returns {string} HTML string
 */
function renderTrendingList(articles) {
    if (!articles || articles.length === 0) return '<p class="text-[#999] text-center py-5">Tidak ada berita trending saat ini.</p>';

    return articles.slice(0, 5).map((article, index) => {
        const detected = window.CategoryMapper.detectCategoryFromArticle(article);
        const badgeClass = window.CategoryMapper.getBadgeClass(detected);
        const label = window.CategoryMapper.getCategoryLabel(detected);
        const url = createArticleUrl(article, detected);

        return `
            <li class="flex items-center gap-5 py-[15px] border-b border-[#eee] transition-colors duration-200 hover:bg-[#f5f5f5] article-fade-in">
                <img src="${getSafeImageUrl(article.urlToImage)}" alt="" class="w-20 h-20 rounded-lg object-cover shrink-0" loading="lazy"
                     onerror="this.src='https://placehold.co/80x80/1a3fc7/white?text=TK'">
                <span class="text-[28px] font-extrabold text-[#ccc] min-w-[40px] text-center">${index + 1}</span>
                <div class="trending-content flex-1">
                    <span class="inline-block py-[3px] px-2.5 rounded-[4px] text-[11px] font-bold text-white uppercase mb-2 ${badgeClass}">${label}</span>
                    <h3><a href="${url}" class="no-underline text-[#222] hover:text-brand">${article.title}</a></h3>
                </div>
            </li>
        `;
    }).join('');
}

/**
 * Render kartu eksklusif (tandai sebagai eksklusif di sessionStorage)
 * @param {Array} articles - Array artikel (max 2)
 * @returns {string} HTML string
 */
function renderExclusiveCards(articles) {
    if (!articles || articles.length === 0) return '';

    return articles.slice(0, 2).map(article => {
        const detected = window.CategoryMapper.detectCategoryFromArticle(article);
        const badgeClass = window.CategoryMapper.getBadgeClass(detected);
        const label = window.CategoryMapper.getCategoryLabel(detected);
        // Tandai sebagai eksklusif sebelum membuat URL
        article._isExclusive = true;
        const url = createArticleUrl(article, detected);

        return `
            <article class="exclusive-card flex-1 bg-white rounded-[10px] overflow-hidden transition-transform duration-300 hover:-translate-y-[3px] article-fade-in">
                <a href="${url}" class="no-underline text-inherit">
                    <img src="${getSafeImageUrl(article.urlToImage)}" alt="${article.title}" loading="lazy"
                         onerror="this.src='https://placehold.co/400x200/1a3fc7/white?text=Eksklusif'">
                    <div class="exclusive-card-body p-[15px]">
                        <span class="inline-block py-[3px] px-2.5 rounded-[4px] text-[11px] font-bold text-white uppercase mb-2 ${badgeClass}">${label}</span>
                        <h3>${article.title}</h3>
                        <p>${article.description || ''}</p>
                    </div>
                </a>
            </article>
        `;
    }).join('');
}

/**
 * Render skeleton loading cards
 * @param {number} count - Jumlah skeleton card
 * @returns {string} HTML string
 */
function renderSkeletonCards(count = 6) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="news-card block bg-white rounded-lg overflow-hidden">
                <div class="skeleton skeleton-image" style="height:180px;"></div>
                <div class="p-[15px]">
                    <div class="skeleton skeleton-text" style="width:60px;height:20px;margin-bottom:10px;"></div>
                    <div class="skeleton skeleton-text" style="width:100%;height:18px;margin-bottom:6px;"></div>
                    <div class="skeleton skeleton-text" style="width:80%;height:18px;margin-bottom:10px;"></div>
                    <div class="skeleton skeleton-text" style="width:100%;height:14px;margin-bottom:4px;"></div>
                    <div class="skeleton skeleton-text" style="width:70%;height:14px;margin-bottom:10px;"></div>
                    <div class="skeleton skeleton-text" style="width:40%;height:12px;"></div>
                </div>
            </div>
        `;
    }
    return html;
}

/** Render skeleton untuk hot news */
function renderSkeletonHotNews() {
    return `
        <div class="hot-news flex gap-[50px] bg-white mx-[50px] my-5">
            <div class="skeleton skeleton-image" style="width:40vw;min-height:300px;"></div>
            <div class="pr-[30px] flex flex-col justify-center gap-5 flex-1">
                <div class="skeleton skeleton-text" style="width:90%;height:35px;"></div>
                <div class="skeleton skeleton-text" style="width:100%;height:16px;"></div>
                <div class="skeleton skeleton-text" style="width:70%;height:16px;"></div>
                <div class="skeleton skeleton-text" style="width:30%;height:14px;"></div>
            </div>
        </div>
    `;
}

/** Render skeleton untuk trending */
function renderSkeletonTrending(count = 5) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <li class="flex items-center gap-5 py-[15px] border-b border-[#eee]">
                <div class="skeleton" style="width:40px;height:32px;border-radius:4px;"></div>
                <div class="flex-1">
                    <div class="skeleton skeleton-text" style="width:60px;height:18px;margin-bottom:8px;"></div>
                    <div class="skeleton skeleton-text" style="width:80%;height:16px;"></div>
                </div>
            </li>
        `;
    }
    return html;
}

/**
 * Render error state
 * @param {string} message - Pesan error
 * @returns {string} HTML string
 */
function renderErrorState(message) {
    return `
        <div class="error-state text-center py-12 px-6">
            <div class="text-[48px] mb-4">⚠️</div>
            <h3 class="text-[20px] text-[#333] mb-2 font-semibold">Gagal Memuat Berita</h3>
            <p class="text-[14px] text-[#777] mb-5 max-w-[400px] mx-auto">${message}</p>
            <button onclick="window.location.reload()" class="bg-brand text-white py-2.5 px-6 rounded-lg border-none cursor-pointer text-[14px] font-semibold hover:bg-brand-hover transition-colors">
                Coba Lagi
            </button>
        </div>
    `;
}

/**
 * Render empty state
 * @returns {string} HTML string
 */
function renderEmptyState() {
    return `
        <div class="error-state text-center py-12 px-6 col-span-3">
            <div class="text-[48px] mb-4">📭</div>
            <h3 class="text-[20px] text-[#333] mb-2 font-semibold">Tidak Ada Berita</h3>
            <p class="text-[14px] text-[#777]">Belum ada berita untuk kategori ini saat ini.</p>
        </div>
    `;
}

/**
 * Render halaman detail artikel lengkap
 * Menampilkan konten lengkap seolah dari database projek ini
 * Artikel eksklusif mendapat paywall overlay untuk non-member
 * @param {Object} article - Objek artikel
 * @param {string} categorySlug - Slug kategori
 * @returns {string} HTML string
 */
function renderArticleDetail(article, categorySlug) {
    if (!article) {
        return `
            <div class="error-state text-center py-20">
                <div class="text-[48px] mb-4">📰</div>
                <h3 class="text-[20px] text-[#333] mb-2">Artikel Tidak Ditemukan</h3>
                <p class="text-[14px] text-[#777] mb-5">Artikel yang Anda cari tidak tersedia atau sudah dihapus.</p>
                <a href="index.html" class="bg-brand text-white py-2.5 px-6 rounded-lg no-underline text-[14px] font-semibold">Kembali ke Beranda</a>
            </div>
        `;
    }

    const detected = categorySlug || window.CategoryMapper.detectCategoryFromArticle(article);
    const badgeClass = window.CategoryMapper.getBadgeClass(detected);
    const label = window.CategoryMapper.getCategoryLabel(detected);
    const authorInitials = getAuthorInitials(article.author);
    const authorName = article.author || 'Redaksi TukangKawal';

    // Bangun konten artikel lengkap (seolah dari database projek ini)
    let contentHtml = '';
    if (article.description) {
        contentHtml += `<p><strong>TukangKawal</strong> — ${article.description}</p>`;
    }
    if (article.content && article.content !== '[Removed]') {
        const cleanContent = article.content.replace(/\[\+\d+ chars\]$/, '').trim();
        contentHtml += `<p>${cleanContent}</p>`;
    }

    // Cek apakah artikel eksklusif dan user bukan member
    const isExclusive = article._isExclusive === true;
    const user = window.getCurrentUser ? window.getCurrentUser() : null;
    const isMember = user && user.role === 'member';
    const showPaywall = isExclusive && !isMember;

    // Jika paywall aktif, tambahkan overlay gembok
    let paywallHtml = '';
    if (showPaywall) {
        paywallHtml = `
            <div class="paywall-overlay">
                <div class="paywall-content">
                    <div class="paywall-icon">🔒</div>
                    <h3 class="text-[22px] font-bold text-[#111] mb-2">Konten Eksklusif</h3>
                    <p class="text-[15px] text-[#555] mb-5 max-w-[400px] mx-auto leading-[1.6]">Artikel ini hanya tersedia untuk pelanggan Pengawal Eksklusif. Berlangganan untuk membaca selengkapnya.</p>
                    <a href="langganan.html" class="inline-block bg-brand text-white py-3 px-8 rounded-lg no-underline text-[15px] font-semibold transition-all duration-200 hover:bg-brand-hover hover:-translate-y-[1px]">Langganan Sekarang</a>
                </div>
            </div>
        `;
    }

    return `
        <h1 class="article-detail-title font-playfair text-[42px] leading-[1.25] text-[#111] mb-4 tracking-[-0.5px]">${article.title}</h1>

        <div class="article-detail-meta flex items-center justify-between border-t border-b border-[#eaeaea] py-4 mb-[30px]">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-[14px]">${authorInitials}</div>
                <div class="flex flex-col">
                    <span class="text-[15px] font-semibold text-[#222]">${authorName}</span>
                    <span class="text-[13px] text-[#777]">${formatFullDate(article.publishedAt)}</span>
                </div>
            </div>
            <div class="flex gap-2.5 items-center">
                ${isExclusive ? '<span class="inline-block py-[3px] px-2.5 rounded-[4px] text-[11px] font-bold text-white uppercase bg-linear-to-r from-[#1e3a8a] to-[#3b82f6]">🔒 Eksklusif</span>' : ''}
                <span class="inline-block py-[3px] px-2.5 rounded-[4px] text-[11px] font-bold text-white uppercase ${badgeClass}">${label}</span>
                <button onclick="navigator.clipboard.writeText(window.location.href).then(()=>alert('Tautan disalin!'))" class="py-1.5 px-3 border border-[#dcdcdc] bg-white rounded-[6px] text-[13px] font-semibold text-[#555] cursor-pointer transition-all duration-200 hover:bg-[#f5f5f5] hover:text-brand hover:border-brand">Salin Tautan</button>
            </div>
        </div>

        <figure class="article-hero mb-[35px]">
            <img src="${getSafeImageUrl(article.urlToImage)}" alt="${article.title}" loading="lazy"
                 onerror="this.src='https://placehold.co/800x400/1a3fc7/white?text=Tukang+Kawal'">
            <figcaption>Dokumentasi TukangKawal</figcaption>
        </figure>

        <div class="${showPaywall ? 'paywall-wrapper' : ''}">
            <article class="article-content font-source-serif text-[18px] leading-[1.8] text-[#2c2c2c]">
                ${contentHtml}
            </article>
            ${paywallHtml}
        </div>

        <div class="mt-10 pt-5 border-t border-[#eaeaea] flex items-center gap-2.5 flex-wrap">
            <span class="text-[14px] font-semibold text-[#555]">Topik Terkait:</span>
            <a href="index.html?category=${detected}" class="inline-block bg-[#f0f0f0] text-[#444] py-1.5 px-3 rounded-[20px] text-[13px] font-medium no-underline transition-colors duration-200 hover:bg-[#e0e0e0] hover:text-brand">${label}</a>
        </div>

        <div id="related-articles" class="mt-10 pt-[30px] border-t border-[#eaeaea]">
            <h3 class="text-[20px] font-bold text-[#222] mb-5">Berita Terkait</h3>
            <div class="article-detail-grid grid grid-cols-4 gap-5" id="related-articles-grid">
                <div class="text-center py-8 col-span-4 text-[#999]">Memuat berita terkait...</div>
            </div>
        </div>
    `;
}

/**
 * Render related articles grid (untuk halaman detail)
 * @param {Object} articlesByCategory - Objek {slug: articles[]}
 * @returns {string} HTML string
 */
function renderRelatedArticlesGrid(articlesByCategory) {
    let html = '';
    for (const [slug, articles] of Object.entries(articlesByCategory)) {
        if (!articles || articles.length === 0) continue;
        const label = window.CategoryMapper.getCategoryLabel(slug);
        const article = articles[0]; // Ambil 1 artikel per kategori
        const url = createArticleUrl(article, slug);

        html += `
            <div class="flex flex-col article-fade-in">
                <h4 class="font-dm-sans text-[15px] font-extrabold uppercase text-[#111] mb-4 pb-2">${label}</h4>
                <a href="${url}" class="block no-underline w-full transition-transform duration-200 hover:-translate-y-[2px]">
                    <img src="${getSafeImageUrl(article.urlToImage)}" alt="${article.title}" class="w-full h-[150px] object-cover mb-2.5 rounded-[4px]" loading="lazy"
                         onerror="this.src='https://placehold.co/300x150/1a3fc7/white?text=${label}'">
                    <h5 class="text-[15px] text-[#333] leading-[1.4] font-semibold">${article.title}</h5>
                </a>
            </div>
        `;
    }
    return html || '<div class="col-span-4 text-center text-[#999] py-5">Tidak ada berita terkait.</div>';
}

/**
 * Render ticker/marquee dari headlines
 * @param {Array} articles - Array artikel (max 5)
 * @returns {string} Teks marquee
 */
function renderTickerText(articles) {
    if (!articles || articles.length === 0) return 'Selamat datang di TukangKawal — Portal Berita Terpercaya';
    return articles.slice(0, 5).map(a => a.title).join(' • ');
}

// Expose ke global scope
window.ArticleRenderer = {
    timeAgo, formatFullDate, createArticleUrl, getSafeImageUrl, getAuthorInitials,
    renderHotNews, renderNewsCards, renderTrendingList, renderExclusiveCards,
    renderSkeletonCards, renderSkeletonHotNews, renderSkeletonTrending,
    renderErrorState, renderEmptyState, renderArticleDetail,
    renderRelatedArticlesGrid, renderTickerText
};
