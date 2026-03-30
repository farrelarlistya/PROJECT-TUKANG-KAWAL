const users = [
    {
        email: 'admin@gmail.com',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        initials: 'AD'
    },
    {
        email: 'user@gmail.com',
        username: 'user',
        password: 'user123',
        role: 'non-member',
        initials: 'US'
    },
    {
        email: 'member@gmail.com',
        username: 'member',
        password: 'member123',
        role: 'member',
        initials: 'MB'
    }
];

function login(identifier, password) {
    const user = users.find(u => 
        (u.email === identifier || u.username === identifier) && 
        u.password === password
    );

    if (user) {
        const userData = {
            email: user.email,
            username: user.username,
            role: user.role,
            initials: user.initials
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));

        if (user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
        return true;
    } else {
        alert('Login Gagal: Username/Email atau Password salah.');
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.register-form');
    
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    if (currentUser) {
        if (currentUser.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const identifier = document.getElementById('namaEmail').value;
            const password = document.getElementById('password').value;

            login(identifier, password);
        });
    }
});
