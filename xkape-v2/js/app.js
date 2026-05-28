import { fetchProducts, CATEGORIES, BRANDS } from './data/products.js';
import { renderHeader, updateResultCount } from './components/header.js';
import { renderFilters } from './components/filters.js';
import { renderProductGrid } from './components/productCard.js';

// ── Estado global ──────────────────────────────
const state = {
  all:      [],
  category: '',
  brand:    '',
  search:   '',
  sort:     'default',
};

// ── Sistema de acceso secreto al admin ─────────
function setupSecretAdminAccess() {
  const adminBtn = document.getElementById('admin-access-btn');
  
  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      window.location.href = '/admin.html';
    });
  }
}

// ── Filtrar y ordenar ──────────────────────────
function getFiltered() {
  let result = [...state.all];

  if (state.category) result = result.filter(p => p.categoria === state.category);
  if (state.brand)    result = result.filter(p => p.marca === state.brand);

  if (state.search.trim()) {
    const q = state.search.toLowerCase().trim();
    result = result.filter(p =>
      (p.nombre     && p.nombre.toLowerCase().includes(q)) ||
      (p.referencia && p.referencia.toLowerCase().includes(q))
    );
  }

  switch (state.sort) {
    case 'price-asc':  result.sort((a, b) => a.precio - b.precio); break;
    case 'price-desc': result.sort((a, b) => b.precio - a.precio); break;
    case 'name-asc':   result.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es')); break;
  }

  return result;
}

// ── Render ─────────────────────────────────────
function render() {
  const filtered = getFiltered();
  const noData   = state.all.length === 0;

  renderProductGrid(filtered, noData);
  updateResultCount(filtered.length);
  renderFilters(state, CATEGORIES, BRANDS, onFilterChange);

  // Actualizar subtitle de resultados
  const subtitle = document.getElementById('results-subtitle');
  if (subtitle) {
    const catLabel = state.category ? ` en <span class="text-primary-light">${state.category}</span>` : '';
    subtitle.innerHTML = `Mostrando <strong class="text-text-high">${filtered.length}</strong> productos${catLabel}`;
  }
}

// ── Eventos ────────────────────────────────────
function onFilterChange(filter, value) {
  if (filter === 'clear') {
    state.category = '';
    state.brand    = '';
  } else {
    state[filter] = value;
    if (filter === 'category') state.brand    = '';
    if (filter === 'brand')    state.category = '';
  }
  closeSidebar();
  render();
}

function onSearchInput(e) {
  state.search = e.target.value;
  render();
}

function onSortChange(e) {
  state.sort = e.target.value;
  render();
}

// ── Sidebar móvil ──────────────────────────────
function openSidebar() {
  document.getElementById('sidebar').classList.remove('-translate-x-full');
  document.getElementById('sidebar-overlay').classList.remove('hidden');
  document.getElementById('mobile-filter-btn')?.setAttribute('aria-expanded', 'true');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.add('-translate-x-full');
  document.getElementById('sidebar-overlay').classList.add('hidden');
  document.getElementById('mobile-filter-btn')?.setAttribute('aria-expanded', 'false');
}

// ── Init ───────────────────────────────────────
async function init() {
  renderHeader();
  setupSecretAdminAccess();

  try {
    state.all = await fetchProducts();
  } catch (err) {
    console.error('Error cargando productos:', err);
    state.all = [];
  }

  render();

  // Búsqueda con debounce
  let timer;
  document.getElementById('search-input')?.addEventListener('input', e => {
    clearTimeout(timer);
    timer = setTimeout(() => onSearchInput(e), 220);
  });

  // Ordenamiento
  document.getElementById('sort-select')?.addEventListener('change', onSortChange);

  // Sidebar móvil
  document.getElementById('mobile-filter-btn')?.addEventListener('click', openSidebar);
  document.getElementById('sidebar-overlay')?.addEventListener('click', closeSidebar);
}

document.addEventListener('DOMContentLoaded', init);