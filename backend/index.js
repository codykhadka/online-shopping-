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

// db.exec("DROP TABLE IF EXISTS users");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    username     TEXT    NOT NULL UNIQUE,
    password     TEXT    NOT NULL,
    role         TEXT    DEFAULT 'user',
    email        TEXT    UNIQUE,
    phone        TEXT,
    reset_token  TEXT,
    token_expiry TEXT,
    created_at   TEXT    DEFAULT (datetime('now'))
  )
`);

if (!db.prepare("PRAGMA table_info(users)").all().some(col => col.name === 'phone')) {
  db.exec("ALTER TABLE users ADD COLUMN phone TEXT");
}
if (!db.prepare("PRAGMA table_info(users)").all().some(col => col.name === 'reset_token')) {
  db.exec("ALTER TABLE users ADD COLUMN reset_token TEXT");
}
if (!db.prepare("PRAGMA table_info(users)").all().some(col => col.name === 'token_expiry')) {
  db.exec("ALTER TABLE users ADD COLUMN token_expiry TEXT");
}

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

// ── Database Schema Updates ──────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id           TEXT PRIMARY KEY,
    customerName TEXT    NOT NULL,
    productName  TEXT    NOT NULL,
    price        REAL    NOT NULL,
    status       INTEGER DEFAULT -1,
    timestamp    TEXT    DEFAULT (datetime('now')),
    address      TEXT    NOT NULL,
    phone        TEXT    NOT NULL,
    user_id      INTEGER DEFAULT NULL,
    assigned_to  INTEGER DEFAULT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(assigned_to) REFERENCES users(id)
  )
`);

if (!db.prepare("PRAGMA table_info(orders)").all().some(col => col.name === 'user_id')) {
  db.exec("ALTER TABLE orders ADD COLUMN user_id INTEGER");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    title     TEXT    NOT NULL,
    message   TEXT    NOT NULL,
    type      TEXT    DEFAULT 'info',
    read      INTEGER DEFAULT 0,
    created_at TEXT   DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS system_config (
    key       TEXT PRIMARY KEY,
    value     TEXT    NOT NULL
  )
`);

// Seed default config
const configCount = db.prepare("SELECT COUNT(*) as c FROM system_config").get();
if (configCount.c === 0) {
  const insert = db.prepare("INSERT INTO system_config (key, value) VALUES (?, ?)");
  insert.run('store_name', 'Danphe Organic');
  insert.run('delivery_charge_standard', '150');
  insert.run('delivery_charge_express', '300');
  insert.run('currency', 'Rs.');
}

// ── Default Home Route ────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1 style="color: #166534;">🌱 Danphe Organic API is Running!</h1>
      <p style="color: #4b5563;">You have successfully started the backend server.</p>
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
  const { name, username, password, phone, email } = req.body;
  if (!name || !username || !password) return res.status(400).json({ success: false, error: 'Name, username, and password are required.' });
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return res.status(400).json({ success: false, error: 'Username already exists. Please choose another.' });
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const result = db.prepare('INSERT INTO users (name, username, password, phone, email) VALUES (?, ?, ?, ?, ?)').run(name, username, hashedPassword, phone || null, email || null);
    res.json({ success: true, user: { id: result.lastInsertRowid, name, username, phone, email } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not register user: ' + err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, error: 'Username and password are required.' });
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid username or password.' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ success: false, error: 'Invalid username or password.' });
  res.json({ success: true, user: { id: user.id, name: user.name, username: user.username, phone: user.phone, email: user.email } });
});

app.post('/api/auth/social-login', async (req, res) => {
  const { provider, token, name, email, profilePic } = req.body;
  if (!provider || !token || !email) {
    return res.status(400).json({ success: false, error: 'Provider, token, and email are required.' });
  }

  try {
    // In a production environment, we would verify the token with the provider here.
    // E.g., for Google: const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    
    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      // Create new user if they don't exist
      // For social logins, we generate a random username if one isn't provided or based on email
      const username = email.split('@')[0] + Math.random().toString(36).substr(2, 4);
      const randomPassword = Math.random().toString(36).substr(2, 10);
      const hashedPassword = bcrypt.hashSync(randomPassword, 10);
      
      const result = db.prepare('INSERT INTO users (name, username, password, email) VALUES (?, ?, ?, ?)')
        .run(name || 'Social User', username, hashedPassword, email);
      
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }
    
    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        username: user.username, 
        phone: user.phone, 
        email: user.email 
      } 
    });
  } catch (err) {
    console.error('Social Login Error:', err);
    res.status(500).json({ success: false, error: 'Social authentication failed: ' + err.message });
  }
});

// ── Account Recovery Protocols ────────────────────────────────────────────────
app.post('/api/auth/forgot-password', (req, res) => {
  const { username } = req.body;
  try {
    const user = db.prepare('SELECT id, username FROM users WHERE username = ?').get(username);
    if (!user) return res.status(404).json({ success: false, error: 'Identity not found.' });

    // Generate a secure 6-digit protocol token
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    db.prepare('UPDATE users SET reset_token = ?, token_expiry = ? WHERE id = ?').run(token, expiry, user.id);
    
    // IMPORTANT: In a real app, this would be sent via email.
    // For this demonstration, we log it to the console for the user to retrieve.
    console.log(`\n[SECURITY PROTOCOL] Recovery Token for @${username}: ${token}\n`);
    
    res.json({ success: true, message: 'Recovery token dispatched.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Protocol initiation failed.' });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = db.prepare('SELECT id FROM users WHERE reset_token = ? AND token_expiry > ?').get(token, new Date().toISOString());
    if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired protocol token.' });

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE id = ?').run(hashedPassword, user.id);
    
    res.json({ success: true, message: 'Identity restored successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Identity restoration failed.' });
  }
});

// ── API Discovery ─────────────────────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({ status: 'active', message: 'Danphe Organic API is running', version: '2.0.0' });
});

// ── Newsletter Subscription ───────────────────────────────────────────────────
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email required' });
  }

  try {
    // Insert notification for admin/owner
    db.prepare('INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)')
      .run('New Newsletter Subscriber', `Identity ${email} has joined the movement.`, 'info');
    
    // Subscriber-side Mock Notification (Owner can see this in the logs)
    console.log(`\n\x1b[36m(MOCK EMAIL) [TO: ${email}]`);
    console.log(`SUBJECT: Welcome to the Danphe Organic Movement!`);
    console.log(`BODY: Thank you for subscribing. Your identity is now part of our sustainable future. 🌿\x1b[0m`);

    // Owner-side Mock Notification
    console.log(`\x1b[33m(MOCK EMAIL) [TO: OWNER@DANPHE.ORG]`);
    console.log(`SUBJECT: New Subscriber Alert!`);
    console.log(`BODY: A new identity (${email}) has joined the movement via the footer protocol.\x1b[0m\n`);
    
    console.log(`\x1b[32m[NEWSLETTER] New subscriber registered: ${email}\x1b[0m`);
    res.json({ success: true, message: 'Welcome to the movement!' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Subscription failed' });
  }
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

// ── Order Routes (SQLite) ──────────────────────────────────────────────────────
app.post('/api/orders', (req, res) => {
  const { id, customerName, productName, price, address, phone, user_id } = req.body;
  const orderId = id || Math.random().toString(36).substr(2, 9);
  const timestamp = new Date().toISOString();
  
  try {
    db.prepare(`
      INSERT INTO orders (id, customerName, productName, price, address, phone, timestamp, status, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, -1, ?)
    `).run(orderId, customerName, productName, price, address, phone, timestamp, user_id || null);
    
    // Create a notification for the admin
    db.prepare(`
      INSERT INTO notifications (title, message, type)
      VALUES (?, ?, ?)
    `).run('New Order Inbound', `Order #ORD-${orderId} received from ${customerName}`, 'order');
    
    res.json({ success: true, order: { id: orderId, customerName, productName, price, address, phone, timestamp, status: -1, user_id } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not create order: ' + err.message });
  }
});

app.get('/api/users/:userId/orders', (req, res) => {
  const { userId } = req.params;
  try {
    const rows = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY timestamp DESC').all(userId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, username, email, password, phone, role, created_at FROM users').all();
    const result = users.map(user => {
      const orders = db.prepare('SELECT * FROM orders WHERE user_id = ?').all(user.id);
      return { ...user, orders };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/orders', (req, res) => { 
  try {
    const rows = db.prepare('SELECT * FROM orders ORDER BY timestamp DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    if (result.changes === 0) return res.status(404).json({ success: false, error: 'Order not found.' });
    
    // Notification for status change
    const statusLabels = ["Confirmed", "Prepared", "Shipping", "Completed"];
    const label = status >= 0 && status < statusLabels.length ? statusLabels[status] : "Updated";
    db.prepare(`
      INSERT INTO notifications (title, message, type)
      VALUES (?, ?, ?)
    `).run('Status Update', `Order #ORD-${id} status changed to ${label}`, 'info');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Notification Routes ───────────────────────────────────────────────────────
app.get('/api/admin/notifications', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/notifications/read', (req, res) => {
  const { ids } = req.body; // Array of notification IDs
  try {
    if (ids && ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      db.prepare(`UPDATE notifications SET read = 1 WHERE id IN (${placeholders})`).run(...ids);
    } else {
      db.prepare('UPDATE notifications SET read = 1').run();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── System Config Routes ──────────────────────────────────────────────────────
app.get('/api/admin/config', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM system_config').all();
    const config = {};
    rows.forEach(r => config[r.key] = r.value);
    res.json(config);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/config', (req, res) => {
  const updates = req.body; // e.g., { store_name: 'New Name', ... }
  try {
    const stmt = db.prepare('INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)');
    const transaction = db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        stmt.run(key, String(value));
      }
    });
    transaction(updates);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Personnel Routes ──────────────────────────────────────────────────────────
app.get('/api/admin/personnel', (req, res) => {
  try {
    // Strictly select only non-sensitive public fields
    const rows = db.prepare("SELECT id, name, role FROM users WHERE role = 'delivery' OR role = 'admin'").all();
    // Add some mock status for now
    const personnel = rows.map(p => ({
      ...p,
      status: Math.random() > 0.5 ? 'Online' : 'Offline',
      lastActive: new Date().toISOString()
    }));
    res.json(personnel);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Global Error Shield ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('\x1b[31m[CRITICAL PROTOCOL FAILURE]\x1b[0m', err.stack);
  res.status(500).json({ success: false, error: 'Internal system fault', stack: err.message });
});

process.on('uncaughtException', (err) => {
  console.error('\x1b[31m[FATAL UNCAUGHT EXCEPTION]\x1b[0m', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\x1b[31m[FATAL UNHANDLED REJECTION]\x1b[0m', reason);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`API check: http://localhost:${PORT}/api/products`);
  console.log(`Admin login: username="${ADMIN_USERNAME}", password="${ADMIN_PASSWORD}"`);
});
