// Handles login state and header UI
function updateHeaderAuthUI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const accountBtn = document.getElementById('accountBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    if (accountBtn && logoutBtn) {
        if (isLoggedIn) {
            accountBtn.style.display = 'none';
            logoutBtn.style.display = '';
        } else {
            accountBtn.style.display = '';
            logoutBtn.style.display = 'none';
        }
    }
    // Attach logout event
    if (logoutBtn) {
        logoutBtn.onclick = function () {
            localStorage.setItem('isLoggedIn', 'false');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            updateHeaderAuthUI();
            window.location.href = 'login.html';
        };
    }
}

// Call this after header is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateHeaderAuthUI);
} else {
    updateHeaderAuthUI();
}
