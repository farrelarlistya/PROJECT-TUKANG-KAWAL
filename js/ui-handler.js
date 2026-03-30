document.addEventListener('DOMContentLoaded', () => {
    const user = window.getCurrentUser ? window.getCurrentUser() : null;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPage === 'admin-dashboard.html') {
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
                <a href="langganan.html" class="action-btn">Pengawal Eksklusif</a>
                <a href="login.html" class="action-btn">Masuk/Daftar</a>
            `;
        } else if (user.role === 'non-member') {
            headerAction.innerHTML = `
                <a href="langganan.html" class="action-btn">Pengawal Eksklusif</a>
                <a href="informasi-akun.html" class="profile-avatar" title="${user.username}">${user.initials || 'US'}</a>
            `;
        } else if (user.role === 'member') {
            headerAction.innerHTML = `
                <span class="header-member-badge">T+</span>
                <a href="mulai-ngawal.html" class="action-btn action-btn-ngawal">Mulai Ngawal</a>
                <a href="informasi-akun.html" class="profile-avatar" title="${user.username}">${user.initials || 'MB'}</a>
            `;
        }
    }

    if (currentPage === 'admin-dashboard.html' && user) {
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
