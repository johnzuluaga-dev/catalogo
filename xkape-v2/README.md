# XKAPE Motorcycle Parts — Catálogo Web v2

## Estructura del proyecto

```
xkape-catalogo/
├── index.html                  # Página principal (Tailwind + Material Symbols)
├── js/
│   ├── data/
│   │   └── products.js         # Configuración de API y categorías/marcas
│   ├── components/
│   │   ├── header.js           # Navbar con buscador
│   │   ├── filters.js          # Sidebar de filtros (categoría + marca)
│   │   └── productCard.js      # Tarjeta de producto + lightbox de imagen
│   └── app.js                  # Estado global, filtros, ordenamiento, init
```

---

## Configuración antes de publicar

### 1. Cloudinary (imágenes)
En `js/data/products.js`, reemplaza:
```js
export const CLOUDINARY_CLOUD_NAME = '';
```
con tu cloud name, por ejemplo:
```js
export const CLOUDINARY_CLOUD_NAME = 'mi-cloud-xkape';
```
Sube las fotos a Cloudinary en una carpeta `xkape/` con el nombre de la referencia:
- `xkape/FG0053.jpg`
- `xkape/FG0141.jpg`

### 2. Conectar la API (backend)
En `js/data/products.js`, cuando el backend esté listo:
1. Elimina la línea `return [];`
2. Descomenta el bloque `fetch`
3. Reemplaza `API_URL` con la URL real

Los campos que debe devolver la API:
| Campo       | Tipo   | Descripción              |
|-------------|--------|--------------------------|
| id          | number | Identificador único      |
| nombre      | string | Nombre del producto      |
| referencia  | string | Código SKU               |
| precio      | number | Precio en COP            |
| categoria   | string | Categoría del producto   |
| marca       | string | Marca compatible         |
| imagen_url  | string | URL completa de Cloudinary |

---

## Cómo ejecutar localmente

Los módulos ES6 requieren un servidor local (no abre directo con doble clic).

### VS Code — Live Server (recomendado)
Instala la extensión **Live Server** → clic en "Go Live".

### Node.js
```bash
npx serve .
```

### Python
```bash
python3 -m http.server 8080
```

---

## Tecnologías
- HTML5 semántico
- Tailwind CSS (CDN)
- Material Symbols (Google)
- Fuentes: Bebas Neue + Barlow + JetBrains Mono
- JavaScript ES6 con módulos nativos (sin bundler)
