export function renderHeader() {
  const nav = document.getElementById('topnav');
  nav.innerHTML = `
    <div class="flex items-center gap-4 md:gap-8 min-w-0">
      <div class="flex flex-col shrink-0">
        <span class="font-brand-logo text-brand-logo text-primary-light uppercase tracking-widest leading-none">XKAPE</span>
        <span class="font-section-label text-[9px] md:text-[10px] text-text-low tracking-[2px] md:tracking-[4px] uppercase mt-1 whitespace-nowrap">
          Motorcycle Parts
        </span>
      </div>

      <div class="hidden md:flex items-center relative group">
        <span class="material-symbols-outlined absolute left-4 text-text-low group-focus-within:text-primary-light transition-colors">search</span>
        <input
          id="search-input"
          type="search"
          class="bg-surface-3 border border-border-muted px-12 py-2 w-[360px] text-body-md font-body-md focus:border-primary-light focus:ring-0 transition-all outline-none"
          placeholder="Buscar por nombre o referencia..."
          autocomplete="off"
        />
      </div>
    </div>

    <div class="flex items-center gap-3 shrink-0">
      <span class="hidden md:block font-technical-data text-technical-data text-text-low whitespace-nowrap">
        <span id="result-count">0</span> PRODUCTOS
      </span>
      <button
        id="cart-toggle-btn"
        class="relative flex items-center gap-1.5 border border-border-muted px-3 py-2 hover:border-primary-light transition-colors"
        aria-label="Ver carrito"
      >
        <span class="material-symbols-outlined text-[20px]">shopping_cart</span>
        <span class="hidden md:block font-section-label text-[11px]">CARRITO</span>
        <span class="cart-badge absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-primary-container text-white font-technical-data text-[10px] font-bold flex items-center justify-center px-1 hidden"></span>
      </button>
      <button
        id="mobile-filter-btn"
        class="lg:hidden flex items-center gap-1.5 border border-border-muted px-3 py-2 hover:border-primary-light transition-colors"
        aria-expanded="false"
        aria-controls="sidebar"
      >
        <span class="material-symbols-outlined text-[20px]">tune</span>
        <span class="font-section-label text-[11px]">FILTROS</span>
      </button>
    </div>
  `;

  // Buscador móvil — se activa al abrir filtros o buscar
  // En móvil el search está dentro del sidebar
}

export function updateResultCount(count) {
  const el = document.getElementById('result-count');
  if (el) el.textContent = count;
}
