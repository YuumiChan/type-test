document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const username = document.getElementById('username');

    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    // Email validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Password validation (at least 8 characters, 1 uppercase, 1 lowercase, 1 number)
    function validatePassword(password) {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return re.test(password);
    }

    // Real-time email validation
    email.addEventListener('input', () => {
        if (!validateEmail(email.value)) {
            emailError.textContent = 'Please enter a valid email address';
            email.setCustomValidity('Invalid email');
        } else {
            emailError.textContent = '';
            email.setCustomValidity('');
        }
    });

    // Real-time password validation
    password.addEventListener('input', () => {
        if (!validatePassword(password.value)) {
            passwordError.textContent = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number';
            password.setCustomValidity('Invalid password');
        } else {
            passwordError.textContent = '';
            password.setCustomValidity('');
        }
    });

    // Real-time confirm password validation
    confirmPassword.addEventListener('input', () => {
        if (password.value !== confirmPassword.value) {
            confirmPasswordError.textContent = 'Passwords do not match';
            confirmPassword.setCustomValidity('Passwords do not match');
        } else {
            confirmPasswordError.textContent = '';
            confirmPassword.setCustomValidity('');
        }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Final validation check
        if (!validateEmail(email.value) || !validatePassword(password.value) || password.value !== confirmPassword.value) {
            return;
        }

        // Registration logic for custom users table
        try {
            // Insert new user into users table
            const { data, error } = await supabase
                .from('users')
                .insert([{ username: username.value, email: email.value, password: password.value }])
                .select()
                .single();
            if (error) throw error;
            // Store user info in localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userId', data.id);
            localStorage.setItem('username', data.username);
            alert('Registration successful! You are now logged in.');
            window.location.href = 'index.html';
        } catch (err) {
            alert('Registration failed: ' + (err.message || err));
        }
    });
});
