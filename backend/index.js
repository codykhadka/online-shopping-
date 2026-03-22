require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Admin credentials — change these in your .env file
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── SQLite Database Setup ─────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'database.sqlite'));

try {
  db.exec("DROP TABLE IF EXISTS users");
} catch (e) {
  console.error("Could not drop users table", e);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT    NOT NULL,
    username TEXT    NOT NULL UNIQUE,
    password TEXT    NOT NULL,
    role     TEXT    DEFAULT 'user',
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// Seed Admin User
const adminCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get();
if (adminCount.c === 0) {
  const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  db.prepare("INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)").run('Root Admin', ADMIN_USERNAME, hashedPassword, 'admin');
  console.log(`[SEED] Admin user created: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`);
}

// Create products table (persists across restarts)
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    price       REAL    NOT NULL,
    discountPrice REAL,
    category    TEXT    NOT NULL,
    image       TEXT    DEFAULT '/images/honey_jar.png',
    rating      REAL    DEFAULT 0,
    inStock     INTEGER DEFAULT 1,
    features    TEXT    DEFAULT '[]'
  )
`);

try {
  const tableInfo = db.prepare("PRAGMA table_info(products)").all();
  if (!tableInfo.some(col => col.name === 'discountPrice')) {
    db.exec("ALTER TABLE products ADD COLUMN discountPrice REAL");
  }
} catch(e) {
  console.error("Could not add discountPrice column", e);
}

// Seed default products only if table is empty
const count = db.prepare('SELECT COUNT(*) as c FROM products').get();
if (count.c === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, description, price, discountPrice, category, image, rating, inStock, features)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const seed = db.transaction((items) => { items.forEach(p => insert.run(...p)); });
  seed([
    ["Pure Raw Honey",          "100% natural and unprocessed raw honey harvested directly from wild forest bees.", 15.99, null, "Honey",          "/images/honey_jar.png",    4.9, 1, JSON.stringify(["No added sugar","Rich in antioxidants","Sustainably sourced"])],
    ["A2 Cow Ghee",             "Traditional bilona churned A2 cow ghee packed with rich aroma and nutritional benefits.", 24.99, 19.99, "Ghee & Oils", "/images/cow_ghee.png",     5.0, 1, JSON.stringify(["Made from A2 cow milk","Traditional bilona method","Rich in Omega-3"])],
    ["Organic Jaggery Powder",  "Chemical-free jaggery powder, a perfect healthy alternative to refined white sugar.", 8.99,  null, "Jaggery",       "/images/jaggery_cubes.png",4.8, 1, JSON.stringify(["No artificial colors","Rich in iron","Unrefined"])],
    ["Cold Pressed Mustard Oil","100% pure cold-pressed mustard oil retaining its natural pungency and health benefits.", 12.49, null, "Ghee & Oils",  "/images/mustard_oil.png",  4.6, 1, JSON.stringify(["Cold-pressed extraction","High smoking point","Cholesterol free"])],
    ["Unsweetened Peanut Butter","Crunchy, all-natural peanut butter made from 100% roasted peanuts with zero additives.", 10.99, null, "Peanut Butter","/images/peanut_butter.png",4.7, 1, JSON.stringify(["100% Roasted Peanuts","No added oil","High protein content"])],
    ["Wild Forest Honey",       "Dark, robust honey collected from deep forest flora with high medicinal value.", 18.99, 15.00, "Honey",          "/images/honey_jar.png",    4.9, 0, JSON.stringify(["Immunity booster","Unpasteurized","Direct from forest tribes"])],
    ["Virgin Coconut Oil",      "Cold-pressed virgin coconut oil, excellent for cooking, baking, and skin care.", 16.50, null, "Ghee & Oils",   "/images/cow_ghee.png",     4.8, 1, JSON.stringify(["Extra virgin","Multi-purpose usage","Non-refined"])],
    ["Jaggery Cubes",           "Convenient, bite-sized jaggery cubes made from naturally grown sugarcane.", 9.99,  null, "Jaggery",         "/images/jaggery_cubes.png",4.5, 1, JSON.stringify(["Easy to use cubes","Healthy sweetener","Farm fresh sugarcane"])],
  ]);
}

// Helper: convert a SQLite product row to the API shape
function rowToProduct(row) {
  return {
    id: String(row.id),
    name: row.name,
    description: row.description,
    price: row.price,
    discountPrice: row.discountPrice,
    category: row.category,
    image: row.image,
    rating: row.rating,
    inStock: row.inStock === 1,
    features: (() => { try { return JSON.parse(row.features); } catch { return []; } })()
  };
}

// Orders stored in-memory (can be moved to SQLite later)
let orders = [];

// ── Default Home Route ────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1 style="color: #166534;">🌱 Danphe Organic API is Running!</h1>
      <p style="color: #4b5563;">You have successfully started the backend server.</p>
      <div style="margin-top: 20px;">
        <a href="/api/products" style="background: #16a34a; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold;">View Products API Data</a>
      </div>
    </div>
  `);
});

// ── Admin Auth ────────────────────────────────────────────────────────────────
app.post('/api/auth/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND role = 'admin'").get(username);
    
    if (user && bcrypt.compareSync(password, user.password)) {
      return res.json({ success: true, admin: { username: user.username, name: user.name, role: 'admin' } });
    }
    return res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── User Auth Routes ──────────────────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password) return res.status(400).json({ success: false, error: 'Name, username, and password are required.' });
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return res.status(400).json({ success: false, error: 'Username already exists. Please choose another.' });
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    db.prepare('INSERT INTO users (name, username, password) VALUES (?, ?, ?)').run(name, username, hashedPassword);
    res.json({ success: true, user: { name, username } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not register user.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, error: 'Username and password are required.' });
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid username or password.' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ success: false, error: 'Invalid username or password.' });
  res.json({ success: true, user: { name: user.name, username: user.username } });
});

// ── API Discovery ─────────────────────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({ status: 'active', message: 'Danphe Organic API is running', version: '2.0.0' });
});

// ── Product Routes (SQLite — persists across restarts) ───────────────────────
app.get('/api/products', (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY id ASC').all();
  res.json(rows.map(rowToProduct));
});

app.post('/api/products', (req, res) => {
  const { name, description = '', price, discountPrice, category, image = '/images/honey_jar.png', features = [], inStock = true } = req.body;
  if (!name || !price || !category) return res.status(400).json({ success: false, error: 'Name, price, and category are required.' });
  const featuresJson = JSON.stringify(Array.isArray(features) ? features : features.split(',').map(f => f.trim()).filter(Boolean));
  const result = db.prepare(
    'INSERT INTO products (name, description, price, discountPrice, category, image, rating, inStock, features) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)'
  ).run(name, description, parseFloat(price), discountPrice ? parseFloat(discountPrice) : null, category, image, inStock ? 1 : 0, featuresJson);
  const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.json({ success: true, product: rowToProduct(newProduct) });
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
  if (!existing) return res.status(404).json({ success: false, error: 'Product not found.' });
  const { name, description, price, discountPrice, category, image, features, inStock } = req.body;
  const updated = {
    name:        name        !== undefined ? name        : existing.name,
    description: description !== undefined ? description : existing.description,
    price:       price       !== undefined ? parseFloat(price) : existing.price,
    discountPrice: discountPrice !== undefined ? (discountPrice ? parseFloat(discountPrice) : null) : existing.discountPrice,
    category:    category    !== undefined ? category    : existing.category,
    image:       image       !== undefined ? image       : existing.image,
    inStock:     inStock     !== undefined ? (inStock ? 1 : 0) : existing.inStock,
    features:    features    !== undefined
      ? JSON.stringify(Array.isArray(features) ? features : features.split(',').map(f => f.trim()).filter(Boolean))
      : existing.features,
  };
  db.prepare(
    'UPDATE products SET name=?, description=?, price=?, discountPrice=?, category=?, image=?, inStock=?, features=? WHERE id=?'
  ).run(updated.name, updated.description, updated.price, updated.discountPrice, updated.category, updated.image, updated.inStock, updated.features, Number(id));
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
  res.json({ success: true, product: rowToProduct(row) });
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
  if (!existing) return res.status(404).json({ success: false, error: 'Product not found.' });
  db.prepare('DELETE FROM products WHERE id = ?').run(Number(id));
  res.json({ success: true, product: rowToProduct(existing) });
});

// ── Order Routes ──────────────────────────────────────────────────────────────
app.post('/api/orders', (req, res) => {
  const order = { ...req.body, id: req.body.id || Math.random().toString(36).substr(2, 9), timestamp: req.body.timestamp || new Date().toISOString(), status: -1 };
  orders.push(order);
  res.json({ success: true, order });
});

app.get('/api/orders', (req, res) => { res.json(orders); });

app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Order not found.' });
  orders[index].status = status;
  res.json({ success: true, order: orders[index] });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`API check: http://localhost:${PORT}/api/products`);
  console.log(`Admin login: username="${ADMIN_USERNAME}", password="${ADMIN_PASSWORD}"`);
});
