function getToken() {
  return localStorage.getItem('token') || '';
}

function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function isLoggedIn() {
  return !!getToken();
}

function authHeaders() {
  return { 'Authorization': 'Bearer ' + getToken() };
}

function toggleNav() {
  document.getElementById('navLinks').classList.toggle('active');
}

function updateNavAuth() {
  const el = document.getElementById('authNav');
  if (!el) return;
  const user = getUser();
  if (user) {
    if (user.role === 'admin') {
      el.textContent = 'Admin';
      el.href = '/admin';
    } else {
      el.textContent = 'Hi, ' + user.name.split(' ')[0];
      el.href = '/cart';
    }
  } else {
    el.textContent = 'Login';
    el.href = '/auth';
  }
}

function updateCartCount() {
  const els = document.querySelectorAll('#cartCount');
  els.forEach(async el => {
    if (!isLoggedIn()) { el.textContent = '0'; return; }
    try {
      const res = await fetch('/api/cart', { headers: authHeaders() });
      if (res.ok) {
        const { cart } = await res.json();
        const count = cart.reduce((sum, c) => sum + c.qty, 0);
        el.textContent = count || '0';
      }
    } catch (e) {}
  });
}

async function addToCart(productId) {
  if (!isLoggedIn()) { window.location.href = '/auth'; return; }
  try {
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty: 1 })
    });
    if (res.ok) {
      updateCartCount();
      alert('Added to cart successfully!');
    } else if (res.status === 401) {
      window.location.href = '/auth';
    }
  } catch (e) {}
}
