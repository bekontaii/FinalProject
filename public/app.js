const apiBase = '/api';

let token = localStorage.getItem('token') || null;
let currentUserRole = null;
let currentUser = null;
let allProducts = [];
let currentCategory = 'all';
let currentGender = null; // 'men', 'women', or null for all

const toastEl = document.getElementById('toast');
const cartIcon = document.getElementById('cartIcon');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartBadge = document.getElementById('cartBadge');
const checkoutBtn = document.getElementById('checkoutBtn');
const userBar = document.getElementById('userBar');
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');
const adminLink = document.getElementById('adminLink');
const sellerSection = document.getElementById('sellerSection');
const productForm = document.getElementById('productForm');
const sellerProductsList = document.getElementById('sellerProductsList');
const reloadProductsBtn = document.getElementById('reloadProducts');
const resetProductFormBtn = document.getElementById('resetProductForm');
const productsGrid = document.getElementById('productsGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('searchInput');

// Cart functions
function getCart() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item._id === product._id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  showToast('Added to cart', 'success');
}

function removeFromCart(productId) {
  const cart = getCart();
  const filtered = cart.filter((item) => item._id !== productId);
  saveCart(filtered);
  showToast('Removed from cart', 'info');
}

function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find((item) => item._id === productId);
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCart(cart);
  }
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function updateCartUI() {
  const cart = getCart();
  const total = getCartTotal();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cartBadge) {
    if (count > 0) {
      cartBadge.textContent = count;
      cartBadge.hidden = false;
    } else {
      cartBadge.hidden = true;
    }
  }

  if (cartTotal) {
    cartTotal.textContent = total.toFixed(2);
  }

  if (checkoutBtn) {
    checkoutBtn.disabled = cart.length === 0;
  }

  if (cartItems) {
    if (cart.length === 0) {
      cartItems.innerHTML = '<p class="empty-cart">Your bag is empty</p>';
    } else {
      cartItems.innerHTML = cart
        .map(
          (item) => `
        <div class="cart-item">
          ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image" />` : '<div class="cart-item-image" style="background: #f5f5f5;"></div>'}
          <div class="cart-item-info">
            <p class="cart-item-name">${item.name}</p>
            <p class="cart-item-price">$${item.price.toFixed(2)} × ${item.quantity}</p>
            <button class="cart-item-remove" onclick="removeFromCart('${item._id}')">Remove</button>
          </div>
        </div>
      `
        )
        .join('');
    }
  }
}

// Make removeFromCart global for onclick
window.removeFromCart = removeFromCart;

// Cart UI handlers
if (cartIcon) {
  cartIcon.addEventListener('click', () => {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('show');
  });
}

if (closeCart) {
  closeCart.addEventListener('click', closeCartSidebar);
}

if (cartOverlay) {
  cartOverlay.addEventListener('click', closeCartSidebar);
}

function closeCartSidebar() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('show');
}

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    const cart = getCart();
    if (cart.length === 0) return;
    if (!token) {
      showToast('Please login to checkout', 'error');
      window.location.href = '/login.html';
      return;
    }
    showToast(`Checkout: $${getCartTotal().toFixed(2)}`, 'success');
    // In a real app, you'd send this to the server
    saveCart([]);
    closeCartSidebar();
  });
}

// Toast
function showToast(message, type = 'info') {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.style.background =
    type === 'error' ? '#c00' : type === 'success' ? '#0a0' : '#000';
  toastEl.hidden = false;
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3000);
}

// API
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

// Auth
async function loadProfile() {
  if (!token) {
    updateUserUI(null);
    return;
  }
  try {
    const user = await apiRequest('/users/profile');
    currentUser = user;
    currentUserRole = user.role;
    updateUserUI(user);
  } catch (err) {
    console.error(err);
    token = null;
    localStorage.removeItem('token');
    updateUserUI(null);
  }
}

function updateUserUI(user) {
  if (user && token) {
    if (userBar) userBar.hidden = false;
    if (userName) userName.textContent = user.name;
    if (userRole) {
      userRole.textContent = user.role;
      userRole.className = `user-role role-${user.role}`;
    }
    if (adminLink) adminLink.hidden = user.role !== 'admin';
    if (sellerSection) sellerSection.hidden = user.role !== 'seller' && user.role !== 'admin';
  } else {
    if (userBar) userBar.hidden = true;
    if (userName) userName.textContent = '';
    if (userRole) userRole.textContent = '';
    if (sellerSection) sellerSection.hidden = true;
    currentUserRole = null;
    currentUser = null;
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    token = null;
    localStorage.removeItem('token');
    updateUserUI(null);
    showToast('Logged out', 'info');
    window.location.reload();
  });
}

// Products - Public view
async function loadAllProducts() {
  if (!productsGrid) return;
  productsGrid.innerHTML = '<p>Loading...</p>';

  try {
    // Load products from external API based on gender filter
    let externalProducts = [];
    try {
      let apiUrl = `${apiBase}/external/products`;
      if (currentGender === 'men') {
        apiUrl = `${apiBase}/external/products/men`;
      } else if (currentGender === 'women') {
        apiUrl = `${apiBase}/external/products/women`;
      }
      
      const externalRes = await fetch(apiUrl);
      if (externalRes.ok) {
        externalProducts = await externalRes.json();
        // Convert external products to match our format
        externalProducts = externalProducts.map(p => ({
          ...p,
          _id: `external_${p.id}`,
          external: true,
          gender: p.gender || 'unisex'
        }));
      }
    } catch (err) {
      console.error('Failed to load external products:', err);
    }

    // Load products from our database (if logged in)
    let dbProducts = [];
    if (token) {
      try {
        dbProducts = await apiRequest('/products');
        // Add gender to DB products if not present
        dbProducts = dbProducts.map(p => ({
          ...p,
          gender: p.gender || 'unisex'
        }));
      } catch (err) {
        console.error('Failed to load DB products:', err);
      }
    }

    // Combine external and database products
    allProducts = [...externalProducts, ...dbProducts];

    filterProducts();
  } catch (err) {
    productsGrid.innerHTML = `<p style="color:#c00;">${err.message}</p>`;
  }
}

function filterProducts() {
  if (!productsGrid) return;

  let filtered = [...allProducts];

  // Filter by gender
  if (currentGender) {
    filtered = filtered.filter((p) => {
      const productGender = p.gender || 'unisex';
      return productGender === currentGender || productGender === 'unisex';
    });
  }

  // Filter by category
  if (currentCategory !== 'all') {
    filtered = filtered.filter((p) => p.category === currentCategory);
  }

  // Filter by search
  if (searchInput && searchInput.value.trim()) {
    const search = searchInput.value.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        (p.description && p.description.toLowerCase().includes(search))
    );
  }

  // Filter out products without valid images
  filtered = filtered.filter((p) => {
    const imageUrl = p.imageUrl || p.image;
    return imageUrl && !imageUrl.includes('placeholder') && imageUrl.startsWith('http');
  });

  if (filtered.length === 0) {
    productsGrid.innerHTML = '<p>No products found</p>';
    return;
  }

  productsGrid.innerHTML = filtered
    .map(
      (p) => {
        const imageUrl = p.imageUrl || p.image;
        const hasValidImage = imageUrl && !imageUrl.includes('placeholder') && imageUrl.startsWith('http');
        
        return `
    <div class="product-card">
      ${hasValidImage 
        ? `<img src="${imageUrl}" alt="${p.name}" class="product-image" onerror="this.onerror=null; this.parentElement.querySelector('.product-image-placeholder')?.classList.remove('hidden'); this.style.display='none';" />` 
        : ''}
      <div class="product-image-placeholder ${hasValidImage ? 'hidden' : ''}">${p.name}</div>
      <div class="product-info">
        <h3 class="product-name">${p.name}</h3>
        <p class="product-price">$${p.price.toFixed(2)}</p>
        <span class="product-category">${p.category}</span>
        ${!p.inStock ? '<span class="badge out-of-stock">Out of stock</span>' : ''}
        ${p.external ? '<span class="badge" style="background:#e3f2fd;color:#1976d2;">External</span>' : ''}
        <div class="product-actions-inline">
          ${currentUserRole === 'user' && p.inStock ? `<button class="btn-primary" onclick="addToCartFromGrid('${p._id}')">Add to Bag</button>` : ''}
          ${!token && p.inStock ? `<button class="btn-primary" onclick="window.location.href='/login.html'">Login to Buy</button>` : ''}
          ${(currentUserRole === 'seller' || currentUserRole === 'admin') && !p.external ? `<button class="btn-secondary" onclick="editProductFromGrid('${p._id}')">Edit</button>` : ''}
        </div>
      </div>
    </div>
  `;
      }
    )
    .join('');
}

window.addToCartFromGrid = function (productId) {
  const product = allProducts.find((p) => p._id === productId);
  if (product) {
    // For external products, we need to create a proper cart item
    const cartItem = {
      _id: product._id || productId,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || product.image,
      category: product.category,
      inStock: product.inStock !== false,
      external: product.external || false
    };
    addToCart(cartItem);
  }
};

window.editProductFromGrid = function (productId) {
  const product = allProducts.find((p) => p._id === productId);
  // Only allow editing products from our database (not external)
  if (product && productForm && !product.external) {
    document.getElementById('productId').value = product._id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productInStock').checked = !!product.inStock;
    document.getElementById('productImageUrl').value = product.imageUrl || '';
    document.getElementById('productDescription').value = product.description || '';
    sellerSection.scrollIntoView({ behavior: 'smooth' });
  }
};

// Category filters
if (filterBtns) {
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      filterProducts();
    });
  });
}

// Gender navigation (ALL/MEN/WOMEN)
const navAll = document.getElementById('navAll');
const navWomen = document.getElementById('navWomen');
const navMen = document.getElementById('navMen');

function updateGenderNav(selected) {
  [navAll, navWomen, navMen].forEach(nav => {
    if (nav) nav.classList.remove('active');
  });
  if (selected) selected.classList.add('active');
}

if (navAll) {
  navAll.addEventListener('click', (e) => {
    e.preventDefault();
    updateGenderNav(navAll);
    currentGender = null;
    loadAllProducts();
  });
}

if (navWomen) {
  navWomen.addEventListener('click', (e) => {
    e.preventDefault();
    updateGenderNav(navWomen);
    currentGender = 'women';
    loadAllProducts();
  });
}

if (navMen) {
  navMen.addEventListener('click', (e) => {
    e.preventDefault();
    updateGenderNav(navMen);
    currentGender = 'men';
    loadAllProducts();
  });
}

// Search
if (searchInput) {
  searchInput.addEventListener('input', () => {
    filterProducts();
  });
}

// Seller products
async function loadSellerProducts() {
  if (!sellerProductsList) return;
  sellerProductsList.innerHTML = '<p>Loading...</p>';

  if (!token || (currentUserRole !== 'seller' && currentUserRole !== 'admin')) {
    sellerProductsList.innerHTML = '<p>Only sellers can see this</p>';
    return;
  }

  try {
    const products = await apiRequest('/products');
    if (!products.length) {
      sellerProductsList.innerHTML = '<p>You have no products yet. Add your first one!</p>';
      return;
    }

    sellerProductsList.innerHTML = products
      .map(
        (p) => `
      <div class="product-item">
        <div class="product-main">
          <div class="product-title-row">
            <span class="product-name">${p.name}</span>
            <span class="badge ${p.category}">${p.category}</span>
            ${!p.inStock ? '<span class="badge out-of-stock">Out of stock</span>' : ''}
          </div>
          ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" style="max-width:100px;border-radius:4px;margin-top:8px;" />` : ''}
          <div class="product-meta">$${p.price.toFixed(2)}</div>
          ${p.description ? `<div style="font-size:0.85rem;color:#666;margin-top:4px;">${p.description}</div>` : ''}
        </div>
        <div class="product-actions">
          <button class="btn-secondary" onclick="editProduct('${p._id}')">Edit</button>
          <button class="btn-secondary" onclick="deleteProduct('${p._id}')" style="background:#fee;color:#c00;">Delete</button>
        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    sellerProductsList.innerHTML = `<p style="color:#c00;">${err.message}</p>`;
  }
}

window.editProduct = function (productId) {
  const product = allProducts.find((p) => p._id === productId);
  if (product && productForm) {
    document.getElementById('productId').value = product._id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productInStock').checked = !!product.inStock;
    document.getElementById('productImageUrl').value = product.imageUrl || '';
    document.getElementById('productDescription').value = product.description || '';
  }
};

window.deleteProduct = async function (productId) {
  if (!confirm('Delete this product?')) return;
  try {
    await apiRequest(`/products/${productId}`, { method: 'DELETE' });
    showToast('Product deleted', 'success');
    await loadSellerProducts();
    await loadAllProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

function clearProductForm() {
  if (!productForm) return;
  document.getElementById('productId').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('productCategory').value = 'clothes';
  document.getElementById('productPrice').value = '';
  document.getElementById('productInStock').checked = true;
  document.getElementById('productImageUrl').value = '';
  document.getElementById('productDescription').value = '';
}

if (productForm) {
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!token) {
      showToast('Please login first', 'error');
      window.location.href = '/login.html';
      return;
    }

    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const inStock = document.getElementById('productInStock').checked;
    const imageUrl = document.getElementById('productImageUrl').value.trim();
    const description = document.getElementById('productDescription').value.trim();

    const payload = {
      name,
      category,
      price,
      inStock,
      description,
      imageUrl,
    };

    try {
      if (id) {
        await apiRequest(`/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showToast('Product updated', 'success');
      } else {
        await apiRequest('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast('Product created', 'success');
      }
      clearProductForm();
      await loadSellerProducts();
      await loadAllProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

if (resetProductFormBtn) {
  resetProductFormBtn.addEventListener('click', clearProductForm);
}

if (reloadProductsBtn) {
  reloadProductsBtn.addEventListener('click', () => {
    loadSellerProducts();
    loadAllProducts();
  });
}

// Initial load
loadProfile().then(() => {
  loadAllProducts();
  loadSellerProducts();
});
updateCartUI();
