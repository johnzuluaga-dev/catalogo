let whatsappNumber = '';

const WA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 shrink-0">
  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
</svg>`;

function formatPrice(price) {
  if (!price && price !== 0) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// ── Persistencia ────────────────────────────────────────────────
function getCart() {
  try { return JSON.parse(localStorage.getItem('xkape_cart') || '[]'); }
  catch { return []; }
}

function saveCart(items) {
  localStorage.setItem('xkape_cart', JSON.stringify(items));
  document.dispatchEvent(new CustomEvent('cart:update'));
}

// ── API pública del carrito ─────────────────────────────────────
export function addToCart(product, quantity = 1) {
  const items = getCart();
  const idx = items.findIndex(i => i.product.id === product.id);
  if (idx >= 0) items[idx].quantity += quantity;
  else items.push({ product, quantity });
  saveCart(items);
}

export function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.product.id !== productId));
}

export function updateQuantity(productId, delta) {
  const items = getCart();
  const idx = items.findIndex(i => i.product.id === productId);
  if (idx < 0) return;
  items[idx].quantity = Math.max(1, items[idx].quantity + delta);
  saveCart(items);
}

export function clearCart() { saveCart([]); }

// ── Helpers ─────────────────────────────────────────────────────
function getTotal(items) {
  return items.reduce((s, i) => s + (i.product.precio || 0) * i.quantity, 0);
}

function getTotalItems(items) {
  return items.reduce((s, i) => s + i.quantity, 0);
}

// ── Badge (usa clase .cart-badge para actualizar todos a la vez) ─
export function updateCartBadge() {
  const total = getTotalItems(getCart());
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = total > 99 ? '99+' : String(total);
    el.classList.toggle('hidden', total === 0);
  });
}

// ── WhatsApp ────────────────────────────────────────────────────
function openWhatsApp() {
  const items = getCart();
  if (!items.length) return;
  const lines = items.map(i =>
    `• ${i.quantity}x ${i.product.nombre}${i.product.referencia ? ` (Ref: ${i.product.referencia})` : ''} - ${formatPrice(i.product.precio)} c/u`
  );
  const total = formatPrice(getTotal(items));
  const msg = encodeURIComponent(
    `🏍️ *PEDIDO XKAPE*\n\n${lines.join('\n')}\n\n*TOTAL: ${total}*\n\n¡Hola! Me gustaría realizar este pedido.`
  );
  window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank');
}

// ── Panel: abrir / cerrar ───────────────────────────────────────
export function openCartPanel() {
  renderCartItems();
  document.getElementById('cart-panel')?.classList.remove('translate-x-full');
  document.getElementById('cart-overlay')?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

export function closeCartPanel() {
  document.getElementById('cart-panel')?.classList.add('translate-x-full');
  document.getElementById('cart-overlay')?.classList.add('hidden');
  document.body.style.overflow = '';
}

// ── Panel: render contenido ─────────────────────────────────────
function renderCartItems() {
  const items = getCart();
  const contentEl = document.getElementById('cart-content');
  const footerEl  = document.getElementById('cart-footer');
  if (!contentEl || !footerEl) return;

  if (items.length === 0) {
    contentEl.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
        <span class="material-symbols-outlined text-[56px] text-border-muted">shopping_cart</span>
        <p class="font-body-md text-body-md text-text-low">El carrito está vacío.<br>¡Agrega productos del catálogo!</p>
      </div>
    `;
    footerEl.innerHTML = `
      <div class="p-5 border-t border-border-muted">
        <button disabled
          class="w-full bg-surface-3 text-text-low font-section-label text-section-label py-4 uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2">
          ${WA_SVG}
          PEDIR POR WHATSAPP
        </button>
      </div>
    `;
    return;
  }

  contentEl.innerHTML = items.map(i => `
    <div class="flex gap-3 p-4 border-b border-border-muted">
      <div class="w-16 h-16 shrink-0 bg-surface-2 flex items-center justify-center overflow-hidden">
        ${i.product.imagen_url
          ? `<img src="${i.product.imagen_url}" alt="" class="w-full h-full object-cover"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
          : ''}
        <span class="material-symbols-outlined text-text-low text-[28px]${i.product.imagen_url ? ' hidden' : ''}"
              style="${i.product.imagen_url ? 'display:none' : ''}">build</span>
      </div>
      <div class="flex flex-col flex-1 min-w-0">
        <p class="font-body-sm text-body-sm text-text-high line-clamp-2 leading-tight">${i.product.nombre || ''}</p>
        ${i.product.referencia
          ? `<p class="font-technical-data text-technical-data text-text-low mt-0.5 uppercase">Ref: ${i.product.referencia}</p>`
          : ''}
        <p class="font-price-display text-price-display text-primary-light mt-1">${formatPrice(i.product.precio)}</p>
        <div class="flex items-center gap-2 mt-2">
          <button class="cart-qty w-7 h-7 border border-border-muted flex items-center justify-center text-text-low hover:border-primary-light hover:text-primary-light transition-colors"
            data-action="dec" data-id="${i.product.id}">
            <span class="material-symbols-outlined text-[16px]">remove</span>
          </button>
          <span class="font-technical-data text-technical-data text-text-high w-6 text-center select-none">${i.quantity}</span>
          <button class="cart-qty w-7 h-7 border border-border-muted flex items-center justify-center text-text-low hover:border-primary-light hover:text-primary-light transition-colors"
            data-action="inc" data-id="${i.product.id}">
            <span class="material-symbols-outlined text-[16px]">add</span>
          </button>
          <button class="ml-auto w-7 h-7 flex items-center justify-center text-text-low hover:text-primary-light transition-colors"
            data-action="remove" data-id="${i.product.id}">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  const totalItems = getTotalItems(items);
  const total      = formatPrice(getTotal(items));

  footerEl.innerHTML = `
    <div class="p-5 border-t border-border-muted space-y-3">
      <div class="flex justify-between items-center">
        <span class="font-section-label text-section-label text-text-low uppercase tracking-widest">
          ${totalItems} artículo${totalItems !== 1 ? 's' : ''}
        </span>
        <span class="font-headline-lg-mobile text-headline-lg-mobile text-text-high">${total}</span>
      </div>
      <button id="cart-whatsapp-btn"
        class="w-full bg-success-whatsapp hover:opacity-90 text-white font-section-label text-section-label py-4 uppercase tracking-widest transition-all flex items-center justify-center gap-2">
        ${WA_SVG}
        PEDIR POR WHATSAPP
      </button>
      <button id="cart-clear-btn"
        class="w-full border border-border-muted text-text-low font-section-label text-[11px] py-2.5 uppercase tracking-widest hover:border-primary-light hover:text-primary-light transition-colors">
        VACIAR CARRITO
      </button>
    </div>
  `;

  document.getElementById('cart-whatsapp-btn')?.addEventListener('click', openWhatsApp);
  document.getElementById('cart-clear-btn')?.addEventListener('click', () => {
    clearCart();
    renderCartItems();
    updateCartBadge();
  });

  contentEl.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { action, id } = btn.dataset;
      const numId = Number(id);
      if (action === 'inc')    updateQuantity(numId, 1);
      else if (action === 'dec')    updateQuantity(numId, -1);
      else if (action === 'remove') removeFromCart(numId);
      renderCartItems();
      updateCartBadge();
    });
  });
}

// ── Inicialización ──────────────────────────────────────────────
export async function initCart() {
  try {
    const r = await fetch('/api/config');
    const cfg = await r.json();
    whatsappNumber = cfg.whatsappNumber || '';
  } catch {
    whatsappNumber = '';
  }

  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'cart-overlay';
  overlay.className = 'fixed inset-0 bg-black/80 z-[400] hidden cursor-pointer';
  overlay.addEventListener('click', closeCartPanel);
  document.body.appendChild(overlay);

  // Panel lateral
  const panel = document.createElement('div');
  panel.id = 'cart-panel';
  panel.className = [
    'fixed right-0 top-0 h-full w-full max-w-[360px]',
    'bg-surface-1 border-l border-border-muted',
    'z-[500] flex flex-col',
    'translate-x-full transition-transform duration-300',
  ].join(' ');
  panel.innerHTML = `
    <div class="flex items-center justify-between px-5 py-4 border-b border-border-muted shrink-0">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-primary-light text-[22px]">shopping_cart</span>
        <span class="font-section-label text-section-label text-text-high uppercase tracking-widest">Mi Carrito</span>
      </div>
      <button id="cart-panel-close"
        class="w-8 h-8 flex items-center justify-center text-text-low hover:text-primary-light transition-colors">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>
    <div id="cart-content" class="flex-1 overflow-y-auto"></div>
    <div id="cart-footer" class="shrink-0"></div>
  `;
  document.body.appendChild(panel);

  document.getElementById('cart-panel-close')?.addEventListener('click', closeCartPanel);
  document.getElementById('cart-toggle-btn')?.addEventListener('click', openCartPanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCartPanel(); });
  document.addEventListener('cart:update', updateCartBadge);

  updateCartBadge();
}
