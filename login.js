document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginButton = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usernameOrEmail = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        // Hash the password using SHA-3 (256)
        const hashedPassword = sha3_256(password);
        try {
            // Query users table for matching username/email and hashed password
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
                .eq('password', hashedPassword)
                .single();
            if (error || !data) throw new Error('Invalid credentials');
            // Store user info in localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userId', data.id);
            localStorage.setItem('username', data.username);
            window.location.href = 'index.html';
        } catch (err) {
            loginButton.classList.add('shake');
            loginForm.reset();
            setTimeout(() => {
                loginButton.classList.remove('shake');
            }, 500);
            alert('Login failed: ' + (err.message || err));
        }
    });
});
