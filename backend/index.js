require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Default Home Route
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

// Mock Data (In a real app, this would be in a database)
let users = [];
let orders = [];
const products = [
  {
    id: "1",
    name: "Pure Raw Honey",
    description: "100% natural and unprocessed raw honey harvested directly from wild forest bees.",
    price: 15.99,
    category: "Honey",
    image: "/honey_jar.png",
    rating: 4.9,
    inStock: true,
    features: ["No added sugar", "Rich in antioxidants", "Sustainably sourced"]
  },
  {
    id: "2",
    name: "A2 Cow Ghee",
    description: "Traditional biloba churned A2 cow ghee packed with rich aroma and nutritional benefits.",
    price: 24.99,
    category: "Ghee & Oils",
    image: "/images/cow_ghee.png",
    rating: 5.0,
    inStock: true,
    features: ["Made from A2 cow milk", "Traditional bilona method", "Rich in Omega-3"]
  },
  {
    id: "3",
    name: "Organic Jaggery Powder",
    description: "Chemical-free jaggery powder, a perfect healthy alternative to refined white sugar.",
    price: 8.99,
    category: "Jaggery",
    image: "/images/jaggery_cubes.png",
    rating: 4.8,
    inStock: true,
    features: ["No artificial colors", "Rich in iron", "Unrefined"]
  },
  {
    id: "4",
    name: "Cold Pressed Mustard Oil",
    description: "100% pure cold-pressed mustard oil retaining its natural pungency and health benefits.",
    price: 12.49,
    category: "Ghee & Oils",
    image: "/images/mustard_oil.png",
    rating: 4.6,
    inStock: true,
    features: ["Cold-pressed extraction", "High smoking point", "Cholesterol free"]
  },
  {
    id: "5",
    name: "Unsweetened Peanut Butter",
    description: "Crunchy, all-natural peanut butter made from 100% roasted peanuts with zero additives.",
    price: 10.99,
    category: "Peanut Butter",
    image: "/images/peanut_butter.png",
    rating: 4.7,
    inStock: true,
    features: ["100% Roasted Peanuts", "No added oil", "High protein content"]
  }
];

// Auth Routes
app.post('/api/auth/register', (req, res) => {
  const { name, username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, error: "Username already exists." });
  }
  const newUser = { name, username, password };
  users.push(newUser);
  res.json({ success: true, user: { name, username } });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, error: "Invalid credentials." });
  }
  res.json({ success: true, user: { name: user.name, username } });
});

// Product Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Order Routes
app.post('/api/orders', (req, res) => {
  const order = {
    ...req.body,
    id: req.body.id || Math.random().toString(36).substr(2, 9),
    timestamp: req.body.timestamp || new Date().toISOString(),
    status: -1
  };
  orders.push(order);
  res.json({ success: true, order });
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: "Order not found." });
  }
  orders[orderIndex].status = status;
  res.json({ success: true, order: orders[orderIndex] });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
