// ─────────────────────────────────────────────────────────────
//  Categorías y marcas
// ─────────────────────────────────────────────────────────────
export const CATEGORIES = [
  'Cables',
  'Transmisión',
  'Frenos',
  'Motor',
  'Eléctrico',
  'Carrocería',
  'Rodamientos',
  'Filtros',
  'Kits',
];

export const BRANDS = [
  'Boxer CT',
  'AKT NKD',
  'Eco Deluxe',
  'Pulsar',
  'Universal',
];

// ─────────────────────────────────────────────────────────────
//  fetchProducts()
//  Usa el backend Express (/api/products).
//  Si se sirve sin servidor Node, cae directamente a Supabase.
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL  = 'https://eoazzevknjxluwfwvwgd.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvYXp6ZXZrbmp4bHV3Znd2d2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDM5OTcsImV4cCI6MjA5NTM3OTk5N30.olQkCvw8OwJjNL4Fqt0vASz69RyIQOpgg5csCHnL6xU';

export async function fetchProducts() {
  // Con el servidor Express, usar la API local
  try {
    const res = await fetch('/api/products');
    if (res.ok) return await res.json();
  } catch {
    // Fallback: acceso directo a Supabase (modo sin servidor)
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/productos?select=*&order=id.asc`,
    {
      headers: {
        'apikey':        SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
      },
    }
  );

  if (!res.ok) throw new Error(`Error Supabase: ${res.status} ${res.statusText}`);
  return await res.json();
}
