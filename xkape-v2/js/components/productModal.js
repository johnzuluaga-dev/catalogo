let currentProduct = null;

export function initModal() {
  if (document.getElementById('product-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'product-modal';
  modal.className = 'fixed inset-0 z-[300] hidden items-center justify-center p-4';
  modal.innerHTML = `
    <div id="modal-backdrop" class="absolute inset-0 bg-black/90"></div>

    <div class="relative z-10 w-full max-w-2xl bg-surface-1 border border-border-muted flex flex-col md:flex-row max-h-[90vh] overflow-hidden">

      <!-- Botón cerrar -->
      <button id="modal-close"
        class="absolute top-3 right-3 z-20 w-9 h-9 bg-surface-3 border border-border-muted flex items-center justify-center text-text-low hover:bg-primary-container hover:text-white hover:border-primary-container transition-all"
        aria-label="Cerrar">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>

      <!-- Imagen -->
      <div class="w-full md:w-[280px] shrink-0 bg-surface-2 flex items-center justify-center aspect-square md:aspect-auto">
        <img id="modal-img" src="" alt=""
          class="w-full h-full object-contain"
        />
        <span id="modal-img-placeholder"
          class="material-symbols-outlined text-[64px] text-border-muted hidden">build</span>
      </div>

      <!-- Info -->
      <div class="flex flex-col flex-1 p-6 md:p-8 overflow-y-auto">

        <!-- Badge categoría -->
        <span id="modal-categoria"
          class="self-start bg-primary-container text-white px-2 py-1 font-section-label text-[10px] tracking-tighter uppercase mb-4">
        </span>

        <!-- Nombre -->
        <h2 id="modal-nombre"
          class="font-headline-lg-mobile text-headline-lg-mobile text-text-high uppercase mb-2">
        </h2>

        <!-- Referencia -->
        <p id="modal-ref"
          class="font-technical-data text-technical-data text-text-low uppercase mb-6">
        </p>

        <!-- Divider -->
        <div class="border-t border-border-muted mb-6"></div>

        <!-- Marca -->
        <div class="flex items-center gap-3 mb-6">
          <span class="material-symbols-outlined text-text-low text-[20px]">motorcycle</span>
          <div>
            <p class="font-section-label text-[10px] text-text-low uppercase tracking-widest mb-0.5">Marca compatible</p>
            <p id="modal-marca" class="font-body-sm text-body-sm text-on-surface"></p>
          </div>
        </div>

      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const imgEl = document.getElementById('modal-img');
  const placeholder = document.getElementById('modal-img-placeholder');
  imgEl.onerror = () => {
    imgEl.classList.add('hidden');
    placeholder.classList.remove('hidden');
  };

  const close = () => {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    currentProduct = null;
  };

  document.getElementById('modal-backdrop').addEventListener('click', close);
  document.getElementById('modal-close').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

export function openModal(product) {
  const modal = document.getElementById('product-modal');
  if (!modal) return;

  currentProduct = product;

  const imgEl = document.getElementById('modal-img');
  const placeholder = document.getElementById('modal-img-placeholder');
  imgEl.classList.remove('hidden');
  placeholder.classList.add('hidden');
  imgEl.src = product.imagen_url || '';
  imgEl.alt = product.nombre || '';
  document.getElementById('modal-nombre').textContent    = product.nombre || '';
  document.getElementById('modal-ref').textContent       = product.referencia ? `Ref: ${product.referencia}` : '';
  document.getElementById('modal-categoria').textContent = product.categoria || '';
  document.getElementById('modal-marca').textContent     = product.marca || '';

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}
