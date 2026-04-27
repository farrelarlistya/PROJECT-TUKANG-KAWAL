document.addEventListener('DOMContentLoaded', () => {
    const user = window.getCurrentUser ? window.getCurrentUser() : null;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
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

    const headerAction = document.querySelector('.header-action');
    
    if (headerAction) {
        if (!user) {
            headerAction.innerHTML = `
                <a href="langganan.html" class="no-underline bg-brand text-white py-2.5 px-[15px] rounded-lg border-none cursor-pointer text-[15px] font-semibold">Pengawal Eksklusif</a>
                <a href="login.html" class="no-underline bg-brand text-white py-2.5 px-[15px] rounded-lg border-none cursor-pointer text-[15px] font-semibold">Masuk/Daftar</a>
            `;
        } else if (user.role === 'non-member') {
            headerAction.innerHTML = `
                <a href="langganan.html" class="no-underline bg-brand text-white py-2.5 px-[15px] rounded-lg border-none cursor-pointer text-[15px] font-semibold">Pengawal Eksklusif</a>
                <a href="informasi-akun.html" class="no-underline w-9 h-9 rounded-full bg-white text-brand flex items-center justify-center text-[13px] font-bold cursor-pointer" title="${user.username}">${user.initials || 'US'}</a>
            `;
        } else if (user.role === 'member') {
            headerAction.innerHTML = `
                <span class="bg-white text-brand text-[12px] font-bold py-1 px-2.5 rounded-full">T+</span>
                <a href="mulai-ngawal.html" class="no-underline bg-brand text-white py-2.5 px-[15px] rounded-lg border-none cursor-pointer text-[15px] font-semibold">Mulai Ngawal</a>
                <a href="informasi-akun.html" class="no-underline w-9 h-9 rounded-full bg-white text-brand flex items-center justify-center text-[13px] font-bold cursor-pointer" title="${user.username}">${user.initials || 'MB'}</a>
            `;
        }
    }

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
