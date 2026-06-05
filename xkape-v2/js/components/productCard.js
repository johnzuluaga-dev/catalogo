import { initModal, openModal } from './productModal.js';

function formatPrice(price) {
  if (!price && price !== 0) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card group bg-surface-1 border border-border-muted transition-all duration-300 flex flex-col cursor-pointer';
  card.setAttribute('data-id', product.id);

  const hasImage = Boolean(product.imagen_url);
  const hasCategoria = Boolean(product.categoria);

  card.innerHTML = `
    <div class="aspect-square overflow-hidden bg-surface-2 relative">
      ${hasImage
        ? `<img
             src="${product.imagen_url}"
             alt="${product.nombre || ''}"
             loading="lazy"
             class="w-full h-full object-cover transition-transform duration-500"
           />
           <div class="card-img-error w-full h-full flex items-center justify-center text-text-low hidden absolute inset-0">
             <span class="material-symbols-outlined text-[48px]">build</span>
           </div>`
        : `<div class="w-full h-full flex items-center justify-center text-text-low">
             <span class="material-symbols-outlined text-[48px]">build</span>
           </div>`
      }
      ${hasCategoria
        ? `<div class="absolute top-2 left-2 md:top-4 md:left-4">
             <span class="bg-primary-container text-white px-2 py-1 font-section-label text-[9px] md:text-[10px] tracking-tighter uppercase">
               ${product.categoria}
             </span>
           </div>`
        : ''
      }
      <!-- Hint ver detalle -->
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
        <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-black/70 px-3 py-1.5">
          <span class="material-symbols-outlined text-white text-[16px]">open_in_full</span>
          <span class="font-section-label text-[10px] text-white uppercase">Ver detalle</span>
        </div>
      </div>
    </div>

    <div class="p-3 md:p-5 flex flex-col flex-1">
      <span class="font-technical-data text-technical-data text-text-low mb-1 uppercase">
        ${product.referencia ? `Ref: ${product.referencia}` : ''}
      </span>
      <h3 class="font-body-sm md:font-body-lg text-body-sm md:text-body-lg font-bold text-text-high mb-2 line-clamp-2 flex-1">
        ${product.nombre || ''}
      </h3>
      <div class="mt-auto pt-2 border-t border-border-muted">
        ${product.precio
          ? `<p class="font-price-display text-price-display text-primary-light">${formatPrice(product.precio)}</p>`
          : ''
        }
      </div>
    </div>
  `;

  if (hasImage) {
    const img = card.querySelector('img');
    const errorDiv = card.querySelector('.card-img-error');
    img.onerror = () => {
      img.classList.add('hidden');
      errorDiv.classList.remove('hidden');
    };
  }

  // Clic en la card → abre modal
  card.addEventListener('click', () => openModal(product));

  return card;
}

export function renderProductGrid(products, isEmpty = false) {
  initModal();

  const grid = document.getElementById('product-grid');
  grid.innerHTML = '';

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-24 text-center gap-4">
        <span class="material-symbols-outlined text-[64px] text-border-muted">
          ${isEmpty ? 'database' : 'search_off'}
        </span>
        <p class="font-body-md text-body-md text-text-low max-w-sm">
          ${isEmpty
            ? 'Los productos aparecerán aquí una vez conectada la base de datos.'
            : 'No se encontraron productos con esos filtros.'}
        </p>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();
  products.forEach(p => fragment.appendChild(createProductCard(p)));
  grid.appendChild(fragment);
}
