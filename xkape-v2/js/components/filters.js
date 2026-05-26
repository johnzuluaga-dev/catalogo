const CATEGORY_ICONS = {
  'Cables':       'settings_input_component',
  'Transmisión':  'settings_ethernet',
  'Frenos':       'settings_slow_motion',
  'Motor':        'engineering',
  'Eléctrico':    'bolt',
  'Carrocería':   'motorcycle',
  'Rodamientos':  'settings',
  'Filtros':      'filter_alt',
  'Kits':         'inventory_2',
};

export function renderFilters(state, categories, brands, onFilterChange) {
  const sidebar = document.getElementById('sidebar');

  sidebar.innerHTML = `
    <div class="mb-8">
      <h3 class="font-section-label text-section-label text-on-surface uppercase mb-1 flex items-center gap-2">
        <span class="material-symbols-outlined text-primary-light" style="font-size:18px">filter_list</span>
        Filtros
      </h3>
      <p class="font-body-sm text-body-sm text-text-low">Optimiza tu búsqueda</p>
    </div>

    <div class="space-y-8">

      <!-- Categorías -->
      <section>
        <h4 class="font-section-label text-[10px] tracking-widest text-text-low uppercase mb-4">Categorías</h4>
        <div class="flex flex-col gap-1" id="category-filters">

          <button data-filter="category" data-value=""
            class="filter-cat-btn group flex items-center gap-3 py-2 px-3 transition-all duration-200 text-left
              ${!state.category
                ? 'text-primary-light border-r-2 border-primary-container bg-surface-2'
                : 'text-on-secondary-container hover:bg-surface-2 hover:text-primary-light'}">
            <span class="material-symbols-outlined text-[20px]">apps</span>
            <span class="font-body-sm text-body-sm">Todos</span>
          </button>

          ${categories.map(cat => `
            <button data-filter="category" data-value="${cat}"
              class="filter-cat-btn group flex items-center gap-3 py-2 px-3 transition-all duration-200 text-left
                ${state.category === cat
                  ? 'text-primary-light border-r-2 border-primary-container bg-surface-2'
                  : 'text-on-secondary-container hover:bg-surface-2 hover:text-primary-light'}">
              <span class="material-symbols-outlined text-[20px]">${CATEGORY_ICONS[cat] || 'build'}</span>
              <span class="font-body-sm text-body-sm">${cat}</span>
            </button>
          `).join('')}
        </div>
      </section>

      <!-- Marcas -->
      <section>
        <h4 class="font-section-label text-[10px] tracking-widest text-text-low uppercase mb-4">Marca compatible</h4>
        <div class="flex flex-col gap-2" id="brand-filters">

          <label class="flex items-center gap-3 cursor-pointer group">
            <input type="radio" name="brand" value="" class="w-4 h-4 bg-surface-3 border-border-muted text-primary-container focus:ring-primary-light"
              ${!state.brand ? 'checked' : ''} />
            <span class="font-body-sm text-body-sm text-on-secondary-container group-hover:text-primary-light transition-colors">Todas</span>
          </label>

          ${brands.map(brand => `
            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="brand" value="${brand}" class="w-4 h-4 bg-surface-3 border-border-muted text-primary-container focus:ring-primary-light"
                ${state.brand === brand ? 'checked' : ''} />
              <span class="font-body-sm text-body-sm text-on-secondary-container group-hover:text-primary-light transition-colors">${brand}</span>
            </label>
          `).join('')}
        </div>
      </section>

    </div>

    <div class="mt-auto pt-8 border-t border-border-muted">
      <button id="clear-filters-btn"
        class="w-full border border-border-muted text-on-secondary-container py-3 font-section-label text-section-label uppercase tracking-widest hover:border-primary-light hover:text-primary-light transition-all flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-[18px]">restart_alt</span>
        Limpiar filtros
      </button>
    </div>
  `;

  // Categorías
  sidebar.querySelectorAll('.filter-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      onFilterChange('category', btn.dataset.value);
    });
  });

  // Marcas
  sidebar.querySelectorAll('input[name="brand"]').forEach(input => {
    input.addEventListener('change', () => {
      onFilterChange('brand', input.value);
    });
  });

  // Limpiar
  document.getElementById('clear-filters-btn').addEventListener('click', () => {
    onFilterChange('clear', '');
  });
}
