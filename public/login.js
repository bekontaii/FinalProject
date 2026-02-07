const apiBase = '/api';

let token = localStorage.getItem('token') || null;

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginCard = document.getElementById('loginCard');
const registerCard = document.getElementById('registerCard');
const loginTab = document.querySelector('[data-tab="login"]');
const registerTab = document.querySelector('[data-tab="register"]');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');
const errorEl = document.getElementById('loginError');

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  setTimeout(() => {
    errorEl.hidden = true;
  }, 5000);
}

function switchTab(tab) {
  if (tab === 'login') {
    loginCard.hidden = false;
    registerCard.hidden = true;
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
  } else {
    loginCard.hidden = true;
    registerCard.hidden = false;
    loginTab.classList.remove('active');
    registerTab.classList.add('active');
  }
}

loginTab.addEventListener('click', () => switchTab('login'));
registerTab.addEventListener('click', () => switchTab('register'));
switchToRegister.addEventListener('click', (e) => {
  e.preventDefault();
  switchTab('register');
});
switchToLogin.addEventListener('click', (e) => {
  e.preventDefault();
  switchTab('login');
});

async function apiRequest(path, options = {}) {
  const headers = options.headers || {};
  headers['Content-Type'] = 'application/json';
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${apiBase}${path}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.message ||
      (data?.errors && data.errors.map((e) => e.msg).join(', ')) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    token = data.token;
    localStorage.setItem('token', token);
    window.location.href = '/';
  } catch (err) {
    showError(err.message);
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const role = document.getElementById('registerRole').value;

  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });

    token = data.token;
    localStorage.setItem('token', token);
    window.location.href = '/';
  } catch (err) {
    showError(err.message);
  }
});

// Redirect if already logged in
if (token) {
  window.location.href = '/';
}
