// ─────────────────────────────────────────────────────────────────
//  XKAPE — Admin Panel
// ─────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'xkape_admin_token';

// ── Utils ────────────────────────────────────────────────────────

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

function authHeaders(json = true) {
  const h = { 'x-admin-token': getToken() };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

function showEl(id)  { document.getElementById(id)?.classList.remove('hidden'); }
function hideEl(id)  { document.getElementById(id)?.classList.add('hidden'); }

// ── Auth ─────────────────────────────────────────────────────────

async function doLogin(password) {
  const res  = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (data.ok) { setToken(data.token); return true; }
  return false;
}

function showPanel() {
  hideEl('login-section');
  showEl('admin-panel');
  document.getElementById('admin-panel').classList.remove('hidden');
  loadProducts();
}

function showLogin() {
  hideEl('admin-panel');
  showEl('login-section');
}

// ── Products ─────────────────────────────────────────────────────

let allProducts = [];

async function loadProducts() {
  hideEl('table-error');
  hideEl('table-wrapper');
  showEl('table-loading');

  try {
    const res  = await fetch('/api/products');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);

    allProducts = data;
    renderTable(allProducts);

    hideEl('table-loading');
    showEl('table-wrapper');

    const stats = document.getElementById('stats-text');
    if (stats) stats.textContent = `${allProducts.length} producto${allProducts.length !== 1 ? 's' : ''} en total`;
  } catch (err) {
    hideEl('table-loading');
    showEl('table-error');
    const msg = document.getElementById('table-error-msg');
    if (msg) msg.textContent = `Error: ${err.message}`;
  }
}

function renderTable(products) {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-12 text-text-low text-sm">
          No hay productos aún. ¡Agrega el primero!
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr class="hover:bg-surface-1 transition-colors" data-id="${p.id}">
      <td class="px-4 py-3 text-text-low font-mono text-xs">${p.id}</td>
      <td class="px-4 py-3">
        ${p.imagen_url
          ? `<img src="${escHtml(p.imagen_url)}" alt="${escHtml(p.nombre)}" class="w-10 h-10 object-cover rounded border border-border-muted" loading="lazy" />`
          : `<div class="w-10 h-10 bg-surface-2 rounded border border-border-muted flex items-center justify-center">
               <span class="material-symbols-outlined text-text-low text-base">image_not_supported</span>
             </div>`}
      </td>
      <td class="px-4 py-3 text-text-high font-medium max-w-[180px] truncate" title="${escHtml(p.nombre)}">${escHtml(p.nombre)}</td>
      <td class="px-4 py-3 font-mono text-xs text-text-low">${escHtml(p.referencia || '—')}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-0.5 bg-surface-2 text-text-low text-xs rounded">${escHtml(p.categoria || '—')}</span>
      </td>
      <td class="px-4 py-3 text-sm text-text-low">${escHtml(p.marca || '—')}</td>
      <td class="px-4 py-3 text-right font-mono text-sm text-on-surface">${formatCOP(p.precio)}</td>
      <td class="px-4 py-3 text-center">
        <div class="flex items-center justify-center gap-2">
          <button class="btn-edit text-text-low hover:text-primary-light transition-colors" data-id="${p.id}" title="Editar">
            <span class="material-symbols-outlined text-lg pointer-events-none">edit</span>
          </button>
          <button class="btn-delete text-text-low hover:text-red-400 transition-colors" data-id="${p.id}" data-nombre="${escHtml(p.nombre)}" title="Eliminar">
            <span class="material-symbols-outlined text-lg pointer-events-none">delete</span>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function escHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// ── Modal (Add / Edit) ────────────────────────────────────────────

let uploadedImageUrl = '';

function openModal(product = null) {
  uploadedImageUrl = '';
  const form = document.getElementById('product-form');
  form.reset();

  document.getElementById('form-id').value         = '';
  document.getElementById('form-imagen-url').value = '';
  document.getElementById('upload-error').textContent = '';
  document.getElementById('form-error').textContent   = '';
  hideEl('upload-error');
  hideEl('form-error');
  hideEl('img-preview-wrap');
  hideEl('upload-progress');

  if (product) {
    document.getElementById('modal-title').textContent      = 'EDITAR PRODUCTO';
    document.getElementById('btn-submit-text').textContent  = 'Actualizar';
    document.getElementById('form-id').value                = product.id;
    document.getElementById('form-nombre').value            = product.nombre     || '';
    document.getElementById('form-referencia').value        = product.referencia || '';
    document.getElementById('form-precio').value            = product.precio     ?? '';
    document.getElementById('form-categoria').value         = product.categoria  || '';
    document.getElementById('form-marca').value             = product.marca      || '';
    document.getElementById('form-imagen-url').value        = product.imagen_url || '';

    if (product.imagen_url) {
      setPreview(product.imagen_url);
      uploadedImageUrl = product.imagen_url;
    }
  } else {
    document.getElementById('modal-title').textContent      = 'AGREGAR PRODUCTO';
    document.getElementById('btn-submit-text').textContent  = 'Guardar';
  }

  document.getElementById('modal-backdrop').classList.remove('hidden');
  document.getElementById('form-nombre').focus();
}

function closeModal() {
  document.getElementById('modal-backdrop').classList.add('hidden');
}

function setPreview(url) {
  const img  = document.getElementById('img-preview');
  const wrap = document.getElementById('img-preview-wrap');
  img.src = url;
  wrap.classList.remove('hidden');
}

function clearPreview() {
  uploadedImageUrl = '';
  document.getElementById('img-preview').src = '';
  hideEl('img-preview-wrap');
  document.getElementById('form-imagen-url').value = '';
  document.getElementById('form-imagen').value = '';
}

// ── Image Upload ──────────────────────────────────────────────────

async function handleImageFile(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showUploadError('Solo se permiten archivos de imagen.');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showUploadError('La imagen no puede superar 10 MB.');
    return;
  }

  hideEl('upload-error');
  showEl('upload-progress');

  const local = URL.createObjectURL(file);
  setPreview(local);

  const fd = new FormData();
  fd.append('image', file);

  try {
    const res  = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-admin-token': getToken() },
      body: fd,
    });
    const data = await res.json();

    hideEl('upload-progress');

    if (!res.ok) throw new Error(data.error || res.statusText);

    uploadedImageUrl = data.url;
    setPreview(data.url);
    document.getElementById('form-imagen-url').value = data.url;
  } catch (err) {
    hideEl('upload-progress');
    showUploadError(`Error al subir: ${err.message}`);
    clearPreview();
  }
}

function showUploadError(msg) {
  const el = document.getElementById('upload-error');
  el.textContent = msg;
  showEl('upload-error');
}

// ── Form Submit ───────────────────────────────────────────────────

async function handleFormSubmit(e) {
  e.preventDefault();
  hideEl('form-error');

  const id         = document.getElementById('form-id').value;
  const nombre     = document.getElementById('form-nombre').value.trim();
  const referencia = document.getElementById('form-referencia').value.trim();
  const precio     = parseFloat(document.getElementById('form-precio').value);
  const categoria  = document.getElementById('form-categoria').value;
  const marca      = document.getElementById('form-marca').value;
  const urlField   = document.getElementById('form-imagen-url').value.trim();
  const imagen_url = uploadedImageUrl || urlField || null;

  if (!nombre || !referencia || isNaN(precio) || !categoria || !marca) {
    showFormError('Por favor completa todos los campos obligatorios (*).');
    return;
  }
  if (precio < 0) {
    showFormError('El precio no puede ser negativo.');
    return;
  }

  const payload = { nombre, referencia, precio, categoria, marca, imagen_url };

  const btn  = document.getElementById('btn-submit');
  const icon = document.getElementById('btn-submit-icon');
  btn.disabled = true;
  icon.classList.add('animate-spin');
  icon.textContent = 'progress_activity';

  try {
    let res, data;

    if (id) {
      res  = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      data = await res.json();
    } else {
      res  = await fetch('/api/products', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      data = await res.json();
    }

    if (!res.ok) {
      const msg = data?.message || data?.error || JSON.stringify(data);
      throw new Error(msg);
    }

    closeModal();
    await loadProducts();
  } catch (err) {
    showFormError(`Error: ${err.message}`);
  } finally {
    btn.disabled = false;
    icon.classList.remove('animate-spin');
    icon.textContent = 'save';
  }
}

function showFormError(msg) {
  const el = document.getElementById('form-error');
  el.textContent = msg;
  showEl('form-error');
}

// ── Delete Confirm ────────────────────────────────────────────────

let pendingDeleteId = null;

function openConfirm(id, nombre) {
  pendingDeleteId = id;
  const msg = document.getElementById('confirm-msg');
  if (msg) msg.textContent = `¿Seguro que deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`;
  document.getElementById('confirm-backdrop').classList.remove('hidden');
}

function closeConfirm() {
  pendingDeleteId = null;
  document.getElementById('confirm-backdrop').classList.add('hidden');
}

async function doDelete() {
  if (!pendingDeleteId) return;
  const id = pendingDeleteId;
  closeConfirm();

  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-token': getToken() },
  });

  if (res.ok || res.status === 204) {
    await loadProducts();
  } else {
    const data = await res.json().catch(() => ({}));
    alert(`Error al eliminar: ${data.error || res.statusText}`);
  }
}

// ── Event Wiring ──────────────────────────────────────────────────

function wireEvents() {
  // Login
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw  = document.getElementById('login-password').value;
    const err = document.getElementById('login-error');
    err.classList.add('hidden');

    const ok = await doLogin(pw);
    if (ok) {
      showPanel();
    } else {
      err.textContent = 'Contraseña incorrecta. Intenta de nuevo.';
      err.classList.remove('hidden');
    }
  });

  // Logout
  document.getElementById('btn-logout').addEventListener('click', () => {
    clearToken();
    showLogin();
  });

  // Add product button
  document.getElementById('btn-add-product').addEventListener('click', () => openModal());

  // Table actions (delegated)
  document.getElementById('products-tbody').addEventListener('click', (e) => {
    const editBtn   = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (editBtn) {
      const id = Number(editBtn.dataset.id);
      const p  = allProducts.find(x => x.id === id);
      if (p) openModal(p);
    }
    if (deleteBtn) {
      openConfirm(Number(deleteBtn.dataset.id), deleteBtn.dataset.nombre);
    }
  });

  // Retry
  document.getElementById('btn-retry')?.addEventListener('click', loadProducts);

  // Modal close
  document.getElementById('btn-modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Form submit
  document.getElementById('product-form').addEventListener('submit', handleFormSubmit);

  // Image URL field sync
  document.getElementById('form-imagen-url').addEventListener('input', (e) => {
    const url = e.target.value.trim();
    if (url) {
      setPreview(url);
      uploadedImageUrl = url;
    } else {
      clearPreview();
    }
  });

  // Remove image
  document.getElementById('btn-remove-img').addEventListener('click', clearPreview);

  // File input via drop zone click
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('form-imagen');

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  });

  // Drag & drop
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', ()  => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer?.files?.[0];
    if (file) handleImageFile(file);
  });

  // Confirm modal
  document.getElementById('btn-confirm-cancel').addEventListener('click', closeConfirm);
  document.getElementById('btn-confirm-delete').addEventListener('click', doDelete);
  document.getElementById('confirm-backdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeConfirm();
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeConfirm();
    }
  });
}

// ── Init ──────────────────────────────────────────────────────────

wireEvents();

if (getToken()) {
  showPanel();
} else {
  showLogin();
}
