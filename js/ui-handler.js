document.addEventListener('DOMContentLoaded', () => {
    const user = window.getCurrentUser ? window.getCurrentUser() : null;

    const rawPath = decodeURIComponent(window.location.pathname);
    const currentPage = rawPath.replace(/\\/g, '/').split('/').pop() || 'index.html';
    const isAdminPage = currentPage.startsWith('admin-');

    if (isAdminPage) {
        if (!user) {
            window.location.href = 'login.html';
            return;
        } else if (user.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
    }

    if (user && user.role === 'admin' && currentPage === 'index.html') {
        window.location.href = 'admin-dashboard.html';
        return;
    }

    // ============================================
    // HEADER ACTION BUTTONS (role-based)
    // ============================================
    const headerAction = document.querySelector('.header-action');
    const isLanggananPage = currentPage === 'langganan.html' || currentPage === 'langganan';
    
    if (headerAction) {
        if (!user) {
            // Belum login: Pengawal Eksklusif -> redirect ke login
            headerAction.innerHTML = `
                <a href="login.html" class="no-underline bg-brand text-white py-2.5 px-[15px] rounded-lg border-none cursor-pointer text-[15px] font-semibold" onclick="alert('Silakan login atau daftar terlebih dahulu untuk mengakses Pengawal Eksklusif.')">Pengawal Eksklusif</a>
                <a href="login.html" class="no-underline bg-brand text-white py-2.5 px-[15px] rounded-lg border-none cursor-pointer text-[15px] font-semibold">Masuk/Daftar</a>
            `;
        } else if (user.role === 'non-member') {
            // Non-member: tampilkan Pengawal Eksklusif (kecuali di halaman langganan)
            const eksklusifBtn = isLanggananPage ? '' : `<a href="langganan.html" class="no-underline bg-brand text-white py-2.5 px-[15px] rounded-lg border-none cursor-pointer text-[15px] font-semibold">Pengawal Eksklusif</a>`;
            headerAction.innerHTML = `
                ${eksklusifBtn}
                <a href="informasi-akun.html" class="no-underline w-9 h-9 rounded-full bg-white text-brand flex items-center justify-center text-[13px] font-bold cursor-pointer" title="${user.username}">${user.initials || 'US'}</a>
            `;
        } else if (user.role === 'member') {
            // Member: Mulai Ngawal + Avatar + T+ badge (di kanan avatar, biru premium)
            headerAction.innerHTML = `
                <a href="mulai-ngawal.html" class="no-underline bg-brand text-white py-2.5 px-[15px] rounded-lg border-none cursor-pointer text-[15px] font-semibold">Mulai Ngawal</a>
                <a href="informasi-akun.html" class="no-underline w-9 h-9 rounded-full bg-white text-brand flex items-center justify-center text-[13px] font-bold cursor-pointer" title="${user.username}">${user.initials || 'MB'}</a>
                <span class="member-badge-plus bg-linear-to-r from-[#1e3a8a] to-[#3b82f6] text-white text-[11px] font-extrabold py-1 px-2 rounded-full shadow-[0_2px_8px_rgba(30,58,138,0.4)] tracking-[0.5px]">T+</span>
            `;
        }
    }

    // ============================================
    // MEMBER: Sembunyikan card CTA langganan di index
    // ============================================
    if (user && user.role === 'member' && (currentPage === 'index.html' || currentPage === '' || currentPage === '/')) {
        // Ganti card "Gabung Pengawal Eksklusif" dengan pesan sudah member
        const exclusiveSection = document.querySelector('section.bg-brand');
        if (exclusiveSection) {
            const ctaCard = exclusiveSection.querySelector('.bg-brand-dark');
            if (ctaCard) {
                // Ganti CTA card dengan container untuk artikel eksklusif tambahan
                ctaCard.outerHTML = `
                    <div id="exclusive-extra-container" class="flex-1 flex gap-5">
                        <!-- Diisi oleh newsApp.js dengan artikel eksklusif tambahan -->
                    </div>
                `;
            }
        }
    }

    // ============================================
    // ADMIN PAGE HANDLERS
    // ============================================
    if (isAdminPage && user) {
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.logout();
            });
        }
        
        const userInfoName = document.querySelector('.user-info strong');
        const userInfoEmail = document.querySelector('.user-info span');
        const userAvatar = document.querySelector('.user-avatar');
        if (userInfoName) userInfoName.textContent = 'Administrator';
        if (userInfoEmail) userInfoEmail.textContent = user.email;
        if (userAvatar) userAvatar.textContent = user.initials;
    }
});
