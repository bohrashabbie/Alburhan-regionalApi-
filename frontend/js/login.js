const API = '';

// Redirect to dashboard if already logged in
if (localStorage.getItem('token')) {
    window.location.href = '/dashboard.html';
}

// Toggle between login & register
document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginCard').classList.add('hidden');
    document.getElementById('registerCard').classList.remove('hidden');
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerCard').classList.add('hidden');
    document.getElementById('loginCard').classList.remove('hidden');
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    const errEl = document.getElementById('loginError');
    errEl.textContent = '';

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        errEl.textContent = 'Please fill in all fields';
        return;
    }

    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Signing in...';
    btn.querySelector('.btn-loader').style.display = 'inline-block';

    try {
        const res = await fetch(`${API}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();

        if (data.success && data.result) {
            localStorage.setItem('token', data.result.access_token);
            localStorage.setItem('user', JSON.stringify(data.result.user));
            window.location.href = '/dashboard.html';
        } else {
            errEl.textContent = data.error || 'Login failed';
        }
    } catch (err) {
        errEl.textContent = 'Network error. Is the server running?';
    } finally {
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Sign In';
        btn.querySelector('.btn-loader').style.display = 'none';
    }
});

// Register
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('registerBtn');
    const errEl = document.getElementById('registerError');
    const successEl = document.getElementById('registerSuccess');
    errEl.textContent = '';
    successEl.textContent = '';

    const username = document.getElementById('regUsername').value.trim();
    const fullname = document.getElementById('regFullname').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!username || !email || !password) {
        errEl.textContent = 'Please fill in all required fields';
        return;
    }

    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Creating...';
    btn.querySelector('.btn-loader').style.display = 'inline-block';

    try {
        const res = await fetch(`${API}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, fullname: fullname || null }),
        });
        const data = await res.json();

        if (data.success && data.statusCode === 201) {
            successEl.textContent = 'Account created! Redirecting to login...';
            setTimeout(() => {
                document.getElementById('registerCard').classList.add('hidden');
                document.getElementById('loginCard').classList.remove('hidden');
            }, 1500);
        } else {
            errEl.textContent = data.error || 'Registration failed';
        }
    } catch (err) {
        errEl.textContent = 'Network error. Is the server running?';
    } finally {
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Create Account';
        btn.querySelector('.btn-loader').style.display = 'none';
    }
});
