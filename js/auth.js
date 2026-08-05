document.addEventListener('DOMContentLoaded', () => {
    initAuthUI();
    bindAuthForms();
});


const STORAGE_KEYS = {
    USERS: 'ecomart_users',
    CURRENT_USER: 'ecomart_current_user'
};
function initAuthUI() {
    const authLink = document.getElementById('authLink');
    const currentUser = getCurrentUser();

    if (authLink) {
        if (currentUser) {
            authLink.innerHTML = `<i class="fa-solid fa-user"></i> ${currentUser.username}`;
            authLink.href = "#";
            authLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm(`Logged in as ${currentUser.username}. Would you like to log out?`)) {
                    logoutUser();
                }
            });
        } else {
            authLink.textContent = 'Login';
            authLink.href = 'login.html';
        }
    }
}
function getCurrentUser() {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
}
function bindAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}
function handleRegister(e) {
    e.preventDefault();
    const alertBox = document.getElementById('authAlert');
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    hideAlert(alertBox);
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordPattern.test(password)) {
        showAlert(alertBox, 'Password must be at least 8 characters long and contain at least one uppercase letter and one number.', 'danger');
        return;
    }

    if (password !== confirmPassword) {
        showAlert(alertBox, 'Passwords do not match.', 'danger');
        return;
    }

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const userExists = users.some(u => u.username === username || u.email === email);
    if (userExists) {
        showAlert(alertBox, 'Username or Email is already registered.', 'danger');
        return;
    }

    const newUser = {
        id: 'USER-' + Date.now(),
        username,
        email,
        password, 
        isAdmin: username.toLowerCase() === 'admin'
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    showAlert(alertBox, 'Registration successful! Redirecting to login...', 'success');

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}


function handleLogin(e) {
    e.preventDefault();
    const alertBox = document.getElementById('authAlert');
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked;

    hideAlert(alertBox);

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    if (users.length === 0 && usernameInput === 'admin' && passwordInput === 'Admin1234') {
        const defaultAdmin = {
            id: 'USER-ADMIN',
            username: 'admin',
            email: 'admin@ecomart.com',
            isAdmin: true
        };
        saveUserSession(defaultAdmin, rememberMe);
        showAlert(alertBox, 'Admin login successful!', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 1000);
        return;
    }

    const user = users.find(u => (u.username === usernameInput || u.email === usernameInput) && u.password === passwordInput);

    if (!user) {
        showAlert(alertBox, 'Invalid username/email or password.', 'danger');
        return;
    }

    saveUserSession({ id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin }, rememberMe);
    
    showAlert(alertBox, 'Login successful! Redirecting...', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}


function saveUserSession(userObj, remember) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userObj));
}


function logoutUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.location.reload();
}


function showAlert(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = `alert-box ${type}`;
    element.classList.remove('hidden');
}

function hideAlert(element) {
    if (!element) return;
    element.classList.add('hidden');
}