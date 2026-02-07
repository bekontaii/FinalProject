const apiBase = '/api';

let token = localStorage.getItem('token') || null;

const toastEl = document.getElementById('toast');

function showToast(message, type = 'info') {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.style.background =
    type === 'error' ? '#b91c1c' : type === 'success' ? '#059669' : '#111827';
  toastEl.hidden = false;
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2200);
}

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

const guardCard = document.getElementById('adminGuard');
const contentCard = document.getElementById('adminContent');
const adminProductsList = document.getElementById('adminProductsList');
const reloadBtn = document.getElementById('adminReload');

async function ensureAdmin() {
  if (!token) {
    guardCard.innerHTML =
      '<p>Please login as admin on the main page first.</p>';
    return false;
  }
  try {
    const user = await apiRequest('/users/profile');
    if (user.role !== 'admin') {
      guardCard.innerHTML = '<p>Access denied. Admins only.</p>';
      return false;
    }
    guardCard.hidden = true;
    contentCard.hidden = false;
    return true;
  } catch (err) {
    guardCard.innerHTML = `<p style="color:#b91c1c;">${err.message}</p>`;
    return false;
  }
}

async function loadAdminProducts() {
  adminProductsList.innerHTML = '<p>Loading...</p>';
  try {
    const products = await apiRequest('/admin/products');
    if (!products.length) {
      adminProductsList.innerHTML = '<p>No products yet.</p>';
      return;
    }
    adminProductsList.innerHTML = '';

    products.forEach((p) => {
      const el = document.createElement('div');
      el.className = 'product-item';

      const main = document.createElement('div');
      main.className = 'product-main';

      const titleRow = document.createElement('div');
      titleRow.className = 'product-title-row';
      const nameSpan = document.createElement('span');
      nameSpan.className = 'product-name';
      nameSpan.textContent = p.name;
      titleRow.appendChild(nameSpan);

      const categoryBadge = document.createElement('span');
      categoryBadge.className = `badge ${p.category}`;
      categoryBadge.textContent = p.category;
      titleRow.appendChild(categoryBadge);

      const statusBadge = document.createElement('span');
      statusBadge.className = 'badge';
      statusBadge.textContent = p.status;
      if (p.status === 'pending') {
        statusBadge.style.background = '#fef3c7';
        statusBadge.style.color = '#92400e';
      } else if (p.status === 'approved') {
        statusBadge.style.background = '#dcfce7';
        statusBadge.style.color = '#166534';
      } else {
        statusBadge.style.background = '#fee2e2';
        statusBadge.style.color = '#b91c1c';
      }
      titleRow.appendChild(statusBadge);

      main.appendChild(titleRow);

      const meta = document.createElement('div');
      meta.className = 'product-meta';
      const ownerInfo = p.owner
        ? `Seller: ${p.owner.name} (${p.owner.email})`
        : 'No owner info';
      meta.textContent = `$${p.price.toFixed(2)} · ${ownerInfo}`;
      main.appendChild(meta);

      if (p.imageUrl) {
        const img = document.createElement('img');
        img.src = p.imageUrl;
        img.alt = p.name;
        img.style.maxWidth = '80px';
        img.style.borderRadius = '8px';
        img.style.marginTop = '4px';
        main.appendChild(img);
      }

      if (p.description) {
        const desc = document.createElement('div');
        desc.style.fontSize = '0.8rem';
        desc.textContent = p.description;
        main.appendChild(desc);
      }

      el.appendChild(main);

      const actions = document.createElement('div');
      actions.className = 'product-actions';

      const approveBtn = document.createElement('button');
      approveBtn.textContent = 'Approve';
      approveBtn.className = 'secondary';
      approveBtn.addEventListener('click', async () => {
        try {
          await apiRequest(`/admin/products/${p._id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'approved' }),
          });
          showToast('Product approved', 'success');
          await loadAdminProducts();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });

      const rejectBtn = document.createElement('button');
      rejectBtn.textContent = 'Reject';
      rejectBtn.addEventListener('click', async () => {
        try {
          await apiRequest(`/admin/products/${p._id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'rejected' }),
          });
          showToast('Product rejected', 'success');
          await loadAdminProducts();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });

      actions.appendChild(approveBtn);
      actions.appendChild(rejectBtn);
      el.appendChild(actions);

      adminProductsList.appendChild(el);
    });
  } catch (err) {
    adminProductsList.innerHTML = `<p style="color:#b91c1c;">${err.message}</p>`;
  }
}

if (reloadBtn) {
  reloadBtn.addEventListener('click', loadAdminProducts);
}

(async () => {
  const ok = await ensureAdmin();
  if (ok) {
    await loadAdminProducts();
  }
})();

