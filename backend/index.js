require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./db');
const Product = require('./Product').default;
const User = require('./User').default;

const app = express();
const PORT = process.env.PORT || 5000;

// Wrap express with HTTP server for Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Connect to MongoDB
connectDB();

// Map of socketId -> userId for presence tracking
const socketToUser = new Map();

// Admin credentials — change these in your .env file
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Cody';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── SQLite Database Setup ─────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'database.sqlite'));

// Seed Admin User in MongoDB
const seedAdmin = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
      const admin = new User({
        name: 'Root Admin',
        username: ADMIN_USERNAME,
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log(`[SEED] Admin user created in MongoDB: ${ADMIN_USERNAME}`);
    }
  } catch (err) {
    console.error("Admin seeding failed:", err);
  }
};
seedAdmin();

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
} catch (e) {
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
    ["Pure Raw Honey", "100% natural and unprocessed raw honey harvested directly from wild forest bees.", 15.99, null, "Honey", "/images/honey_jar.png", 4.9, 1, JSON.stringify(["No added sugar", "Rich in antioxidants", "Sustainably sourced"])],
    ["A2 Cow Ghee", "Traditional bilona churned A2 cow ghee packed with rich aroma and nutritional benefits.", 24.99, 19.99, "Ghee & Oils", "/images/cow_ghee.png", 5.0, 1, JSON.stringify(["Made from A2 cow milk", "Traditional bilona method", "Rich in Omega-3"])],
    ["Organic Jaggery Powder", "Chemical-free jaggery powder, a perfect healthy alternative to refined white sugar.", 8.99, null, "Jaggery", "/images/jaggery_cubes.png", 4.8, 1, JSON.stringify(["No artificial colors", "Rich in iron", "Unrefined"])],
    ["Cold Pressed Mustard Oil", "100% pure cold-pressed mustard oil retaining its natural pungency and health benefits.", 12.49, null, "Ghee & Oils", "/images/mustard_oil.png", 4.6, 1, JSON.stringify(["Cold-pressed extraction", "High smoking point", "Cholesterol free"])],
    ["Unsweetened Peanut Butter", "Crunchy, all-natural peanut butter made from 100% roasted peanuts with zero additives.", 10.99, null, "Peanut Butter", "/images/peanut_butter.png", 4.7, 1, JSON.stringify(["100% Roasted Peanuts", "No added oil", "High protein content"])],
    ["Wild Forest Honey", "Dark, robust honey collected from deep forest flora with high medicinal value.", 18.99, 15.00, "Honey", "/images/honey_jar.png", 4.9, 0, JSON.stringify(["Immunity booster", "Unpasteurized", "Direct from forest tribes"])],
    ["Virgin Coconut Oil", "Cold-pressed virgin coconut oil, excellent for cooking, baking, and skin care.", 16.50, null, "Ghee & Oils", "/images/cow_ghee.png", 4.8, 1, JSON.stringify(["Extra virgin", "Multi-purpose usage", "Non-refined"])],
    ["Jaggery Cubes", "Convenient, bite-sized jaggery cubes made from naturally grown sugarcane.", 9.99, null, "Jaggery", "/images/jaggery_cubes.png", 4.5, 1, JSON.stringify(["Easy to use cubes", "Healthy sweetener", "Farm fresh sugarcane"])],
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
    user_id      TEXT    DEFAULT NULL,
    assigned_to  TEXT    DEFAULT NULL
  )
`);

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

// ── Product Comments Table ───────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS product_comments (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id   TEXT    NOT NULL,
    user_id      TEXT    NOT NULL,
    user_name    TEXT    NOT NULL,
    text         TEXT    NOT NULL,
    is_motivational INTEGER DEFAULT 0,
    created_at   TEXT    DEFAULT (datetime('now'))
  )
`);

// GET all comments for a product
app.get('/api/products/:id/comments', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM product_comments WHERE product_id = ? ORDER BY created_at ASC').all(req.params.id);
    res.json(rows.map(r => ({ ...r, isMotivational: r.is_motivational === 1 })));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST a new comment
app.post('/api/products/:id/comments', (req, res) => {
  const { user_id, user_name, text, isMotivational } = req.body;
  if (!text?.trim()) return res.status(400).json({ success: false, error: 'Comment text required.' });
  try {
    const result = db.prepare(
      'INSERT INTO product_comments (product_id, user_id, user_name, text, is_motivational) VALUES (?, ?, ?, ?, ?)'
    ).run(req.params.id, user_id || 'guest', user_name || 'Anonymous', text.trim(), isMotivational ? 1 : 0);
    const row = db.prepare('SELECT * FROM product_comments WHERE id = ?').get(result.lastInsertRowid);
    res.json({ success: true, comment: { ...row, isMotivational: row.is_motivational === 1 } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Persistent Chat Tables ────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_sessions (
    userId TEXT PRIMARY KEY,
    userName TEXT NOT NULL,
    socketId TEXT,
    lastActive TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    text TEXT NOT NULL,
    isUser INTEGER NOT NULL,
    timestamp TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(userId) REFERENCES chat_sessions(userId)
  )
`);

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
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, role: 'admin' });

    if (user && bcrypt.compareSync(password, user.password)) {
      return res.json({ success: true, admin: { id: user._id, username: user.username, name: user.name, role: 'admin', avatar: user.avatar } });
    }
    return res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── User Auth Routes ──────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { name, username, password, phone, email } = req.body;
  if (!name || !username || !password) return res.status(400).json({ success: false, error: 'Name, username, and password are required.' });

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ success: false, error: 'Username already exists.' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = new User({ name, username, password: hashedPassword, phone, email });
    await user.save();

    res.json({ success: true, user: { id: user._id, name, username, phone, email } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, error: 'Username and password are required.' });

  try {
    const user = await User.findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }
    res.json({ success: true, user: { id: user._id, name: user.name, username: user.username, phone: user.phone, email: user.email, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/social-login', async (req, res) => {
  const { email, name, profilePic } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      const username = email.split('@')[0] + Math.random().toString(36).substr(2, 4);
      user = new User({ name, username, email, avatar: profilePic, password: 'social-login-no-password' });
      await user.save();
    }
    res.json({ success: true, user: { id: user._id, name: user.name, username: user.username, avatar: user.avatar } });
  } catch (err) {
    console.error('Social Login Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Account Recovery Protocols ────────────────────────────────────────────────
app.post('/api/auth/forgot-password', async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    user.reset_token = token;
    user.token_expiry = new Date(Date.now() + 3600000);
    await user.save();

    console.log(`[RECOVERY] Token for @${username}: ${token}`);
    res.json({ success: true, message: 'Token dispatched.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Protocol initiation failed.' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({ reset_token: token, token_expiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired protocol token.' });

    user.password = bcrypt.hashSync(newPassword, 10);
    user.reset_token = undefined;
    user.token_expiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Identity restored successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Identity restoration failed.' });
  }
});

// ── Admin User Management (MongoDB) ──────────────────────────────────────────
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find().lean();
    const result = users.map(user => {
      const orders = db.prepare('SELECT * FROM orders WHERE user_id = ?').all(user._id.toString());
      return { ...user, id: user._id, orders };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/personnel', async (req, res) => {
  try {
    const rows = await User.find({ role: { $in: ['delivery', 'admin'] } }).select('name role _id').lean();
    res.json(rows.map(p => ({ ...p, id: p._id, status: 'Online', lastActive: new Date().toISOString() })));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── API Discovery ─────────────────────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({ status: 'active', message: 'Danphe Organic API is running', version: '2.0.0' });
});

// ── Payment Routes (Traditional/Manual) ──────────────────────────────────────
app.post('/api/payments/traditional', (req, res) => {
  const { orderId, paymentMethod, amount, transactionId } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ success: false, error: 'Order ID and amount are required.' });
  }

  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    // Update order status to 0 (Confirmed)
    db.prepare('UPDATE orders SET status = 0 WHERE id = ?').run(orderId);

    // Create a notification for the admin
    db.prepare('INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)')
      .run('Payment Received', `Traditional payment of ${amount} for Order #ORD-${orderId} logged.`, 'info');

    console.log(`[PAYMENT] Success for Order ${orderId}: ${amount} via ${paymentMethod}`);
    res.json({ success: true, message: 'Payment recorded successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Payment processing failed: ' + err.message });
  }
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

// ── Product Routes (MongoDB) ────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: 1 });
    // Map _id to id for frontend compatibility
    res.json(products.map(p => ({ ...p.toObject(), id: p._id })));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, discountPrice, category, image, features, inStock } = req.body;
    if (!name || !price || !category) return res.status(400).json({ success: false, error: 'Name, price, and category are required.' });

    const product = new Product({
      name, description, category, image,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      features: Array.isArray(features) ? features : (features?.split(',').map(f => f.trim()).filter(Boolean) || []),
      inStock: inStock === undefined ? true : !!inStock
    });

    await product.save();
    res.json({ success: true, product: { ...product.toObject(), id: product._id } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
    if (!updatedProduct) return res.status(404).json({ success: false, error: 'Product not found.' });
    res.json({ success: true, product: { ...updatedProduct.toObject(), id: updatedProduct._id } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ success: false, error: 'Product not found.' });
    res.json({ success: true, product: { ...deletedProduct.toObject(), id: deletedProduct._id } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
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

// ── Socket.io Connection Handlers ──────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[SOCKET] Client connected: ${socket.id}`);

  // Admin joins the secure admin room
  socket.on('join_admin', () => {
    socket.join('adminRoom');
    console.log(`[SOCKET] Admin joined adminRoom: ${socket.id}`);

    // Fetch all sessions and messages from database
    const sessionsRows = db.prepare("SELECT * FROM chat_sessions ORDER BY lastActive DESC").all();
    const activeChatSessions = {};

    sessionsRows.forEach(row => {
      // Check if this user has any active sockets
      const isOnline = Array.from(socketToUser.values()).includes(row.userId);

      const messages = db.prepare("SELECT text, isUser, timestamp FROM chat_messages WHERE userId = ? ORDER BY id ASC").all(row.userId);
      activeChatSessions[row.userId] = {
        userId: row.userId,
        userName: row.userName,
        socketId: row.socketId,
        lastActive: row.lastActive,
        messages: messages.map(m => ({
          id: Math.random().toString(36).substr(2, 9),
          text: m.text,
          isUser: m.isUser === 1,
          timestamp: m.timestamp
        }))
      };
    });

    socket.emit('sync_sessions', activeChatSessions);
  });

  // User identifies themselves upon connection to sync their latest socketId/name
  socket.on('user_identify', (data) => {
    console.log(`[SOCKET] User identity received: ${data.userName} (${data.userId})`);

    // Map this socket to this specific user ID
    socketToUser.set(socket.id, data.userId);

    const timestamp = new Date().toISOString();

    // Update session record with latest socketId and potentially updated userName
    db.prepare(`
      INSERT INTO chat_sessions (userId, userName, socketId, lastActive) 
      VALUES (?, ?, ?, ?)
      ON CONFLICT(userId) DO UPDATE SET 
      userName=excluded.userName, 
      socketId=excluded.socketId, 
      lastActive=excluded.lastActive
    `).run(data.userId, data.userName, socket.id, timestamp);

    // Notify admins that this user is online/updated
    io.to('adminRoom').emit('update_user_status', {
      userId: data.userId,
      userName: data.userName,
      socketId: socket.id,
      lastActive: timestamp,
      isOnline: true
    });

    // Send history back to the user so they see the admin's replies from when they were offline
    const messages = db.prepare("SELECT text, isUser, timestamp FROM chat_messages WHERE userId = ? ORDER BY id ASC").all(data.userId);
    socket.emit('chat_history', messages.map(m => ({
      id: Math.random().toString(36).substr(2, 9),
      text: m.text,
      isUser: m.isUser === 1,
      timestamp: m.timestamp
    })));
  });

  // Handle incoming messages from users
  socket.on('user_message', (data) => {
    console.log(`[SOCKET] User message from ${data.userId || 'Guest'}: ${data.text}`);

    const timestamp = new Date().toISOString();
    const userName = data.userName || 'Guest';

    // Save or update session
    db.prepare(`
      INSERT INTO chat_sessions (userId, userName, socketId, lastActive) 
      VALUES (?, ?, ?, ?)
      ON CONFLICT(userId) DO UPDATE SET 
      userName=excluded.userName, 
      socketId=excluded.socketId, 
      lastActive=excluded.lastActive
    `).run(data.userId, userName, socket.id, timestamp);

    // Save message
    db.prepare('INSERT INTO chat_messages (userId, text, isUser, timestamp) VALUES (?, ?, 1, ?)')
      .run(data.userId, data.text, timestamp);

    // Broadcast to admins
    io.to('adminRoom').emit('user_message', {
      ...data,
      socketId: socket.id,
      timestamp: timestamp
    });
  });

  // Handle replies from admin to a specific user
  socket.on('admin_message', (data) => {
    console.log(`[SOCKET] Admin reply to ${data.targetSocketId}: ${data.text}`);

    const timestamp = new Date().toISOString();
    const userId = data.userId; // Frontend now sends userId

    if (userId) {
      db.prepare('UPDATE chat_sessions SET lastActive = ? WHERE userId = ?').run(timestamp, userId);
      db.prepare('INSERT INTO chat_messages (userId, text, isUser, timestamp) VALUES (?, ?, 0, ?)')
        .run(userId, data.text, timestamp);

      // Broadcast the reply to ALL admins (including the sender for sync)
      io.to('adminRoom').emit('admin_message_received', {
        userId: userId,
        text: data.text,
        timestamp: timestamp
      });
    }

    if (data.targetSocketId) {
      io.to(data.targetSocketId).emit('admin_reply', {
        text: data.text,
        timestamp: timestamp
      });
    }
  });

  socket.on('disconnect', () => {
    const userId = socketToUser.get(socket.id);
    if (userId) {
      console.log(`[SOCKET] User offline: ${userId}`);
      socketToUser.delete(socket.id);

      // Notify admins that this specific user went offline
      io.to('adminRoom').emit('update_user_status', {
        userId: userId,
        isOnline: false
      });
    } else {
      console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`API check: http://localhost:${PORT}/api/products`);
  console.log(`Admin login: username="${ADMIN_USERNAME}", password="${ADMIN_PASSWORD}"`);
});
