function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        return JSON.parse(userStr);
    }
    return null;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

window.getCurrentUser = getCurrentUser;
window.logout = logout;
