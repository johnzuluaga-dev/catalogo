require('dotenv').config();
const express  = require('express');
const multer   = require('multer');
const cloudinary = require('cloudinary').v2;
const path     = require('path');

const app    = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── Cloudinary ────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Config ────────────────────────────────────────────────────
const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON;
const ADMIN_PASS    = process.env.ADMIN_PASSWORD || 'xkape2024';

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'xkape-v2')));

function requireAdmin(req, res, next) {
  if (req.headers['x-admin-token'] !== ADMIN_PASS) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
}

function supabaseHeaders(extra = {}) {
  return {
    'apikey':        SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type':  'application/json',
    ...extra,
  };
}

// ── Config pública (frontend) ─────────────────────────────────
app.get('/api/config', (req, res) => {
  res.json({ whatsappNumber: process.env.WHATSAPP_NUMBER || '' });
});

// ── Auth ──────────────────────────────────────────────────────
app.post('/api/auth', (req, res) => {
  if (req.body.password === ADMIN_PASS) {
    res.json({ ok: true, token: ADMIN_PASS });
  } else {
    res.status(401).json({ error: 'Contraseña incorrecta' });
  }
});

// ── Upload imagen → Cloudinary ────────────────────────────────
app.post('/api/upload', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });

  try {
    const url = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'xkape-products', resource_type: 'image' },
        (err, result) => (err ? reject(err) : resolve(result.secure_url))
      );
      stream.end(req.file.buffer);
    });
    res.json({ url });
  } catch (err) {
    console.error('Cloudinary error:', err.message);
    res.status(500).json({ error: 'Error al subir la imagen a Cloudinary' });
  }
});

// ── Productos — GET (público) ─────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/productos?select=*&order=id.asc`, {
      headers: supabaseHeaders(),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// ── Productos — POST (admin) ──────────────────────────────────
app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/productos`, {
      method: 'POST',
      headers: supabaseHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// ── Productos — PUT (admin) ───────────────────────────────────
app.put('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.${req.params.id}`, {
      method: 'PATCH',
      headers: supabaseHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// ── Productos — DELETE (admin) ────────────────────────────────
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.${req.params.id}`, {
      method: 'DELETE',
      headers: supabaseHeaders(),
    });
    if (!r.ok) {
      const data = await r.json();
      return res.status(r.status).json(data);
    }
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  XKAPE Admin corriendo en → http://localhost:${PORT}`);
  console.log(`  Catálogo  →  http://localhost:${PORT}/index.html`);
  console.log(`  Admin     →  http://localhost:${PORT}/admin.html\n`);
});
