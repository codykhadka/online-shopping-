import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcryptjs';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { connectDB } from './db';
import Product from './Product';
import User from './User';
import Order from './Order';
import Notification from './Notification';
import SystemConfig from './SystemConfig';
import { ChatSession, ChatMessage } from './Chat';
import Comment from './Comment';
import jwt from 'jsonwebtoken';
import { auth, AuthRequest } from './middleware/auth';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("[CRITICAL] JWT_SECRET is not defined in environment variables.");
    process.exit(1);
}
const PORT = Number(process.env.PORT) || 5000;

// Wrap express with HTTP server for Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

// Connect to MongoDB
connectDB();

// Map of socketId -> userId for presence tracking
const socketToUser = new Map();
let activeVisitors = 0;

// Admin credentials — change these in your .env file
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Cody';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── Database Seeding ─────────────────────────────────────────────────────────

// Seed Admin User
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
    } catch (err: any) {
        console.error("Admin seeding failed:", err);
    }
};

// Seed System Config
const seedConfig = async () => {
    try {
        const count = await SystemConfig.countDocuments();
        if (count === 0) {
            await SystemConfig.insertMany([
                { key: 'store_name', value: 'Danphe Organic' },
                { key: 'delivery_charge_standard', value: '150' },
                { key: 'delivery_charge_express', value: '300' },
                { key: 'currency', value: 'Rs.' }
            ]);
            console.log("[SEED] System configuration initialized.");
        }
    } catch (err: any) {
        console.error("Config seeding failed:", err);
    }
};

// Seed Products
const seedProducts = async () => {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            const initialProducts = [
                { name: "Pure Raw Honey", description: "100% natural and unprocessed raw honey harvested directly from wild forest bees.", price: 15.99, discountPrice: null, category: "Honey", image: "/images/honey_jar.png", rating: 4.9, inStock: true, features: ["No added sugar", "Rich in antioxidants", "Sustainably sourced"], isFeatured: true },
                { name: "A2 Cow Ghee", description: "Traditional bilona churned A2 cow ghee packed with rich aroma and nutritional benefits.", price: 24.99, discountPrice: 19.99, category: "Ghee & Oils", image: "/images/cow_ghee.png", rating: 5.0, inStock: true, features: ["Made from A2 cow milk", "Traditional bilona method", "Rich in Omega-3"], isFeatured: true },
                { name: "Organic Jaggery Powder", description: "Chemical-free jaggery powder, a perfect healthy alternative to refined white sugar.", price: 8.99, discountPrice: null, category: "Jaggery", image: "/images/jaggery_cubes.png", rating: 4.8, inStock: true, features: ["No artificial colors", "Rich in iron", "Unrefined"] },
                { name: "Cold Pressed Mustard Oil", description: "100% pure cold-pressed mustard oil retaining its natural pungency and health benefits.", price: 12.49, discountPrice: null, category: "Ghee & Oils", image: "/images/mustard_oil.png", rating: 4.6, inStock: true, features: ["Cold-pressed extraction", "High smoking point", "Cholesterol free"] },
                { name: "Unsweetened Peanut Butter", description: "Crunchy, all-natural peanut butter made from 100% roasted peanuts with zero additives.", price: 10.99, discountPrice: null, category: "Peanut Butter", image: "/images/peanut_butter.png", rating: 4.7, inStock: true, features: ["100% Roasted Peanuts", "No added oil", "High protein content"] },
                { name: "Wild Forest Honey", description: "Dark, robust honey collected from deep forest flora with high medicinal value.", price: 18.99, discountPrice: 15.00, category: "Honey", image: "/images/honey_jar.png", rating: 4.9, inStock: false, features: ["Immunity booster", "Unpasteurized", "Direct from forest tribes"], isFeatured: true },
                { name: "Virgin Coconut Oil", description: "Cold-pressed virgin coconut oil, excellent for cooking, baking, and skin care.", price: 16.50, discountPrice: null, category: "Ghee & Oils", image: "/images/cow_ghee.png", rating: 4.8, inStock: true, features: ["Extra virgin", "Multi-purpose usage", "Non-refined"] },
                { name: "Jaggery Cubes", description: "Convenient, bite-sized jaggery cubes made from naturally grown sugarcane.", price: 9.99, discountPrice: null, category: "Jaggery", image: "/images/jaggery_cubes.png", rating: 4.5, inStock: true, features: ["Easy to use cubes", "Healthy sweetener", "Farm fresh sugarcane"] },
            ];
            await Product.insertMany(initialProducts);
            console.log("[SEED] Products initialized.");
        }
    } catch (err: any) {
        console.error("Product seeding failed:", err);
    }
};

// Initialize all seeders
const initDB = async () => {
    await seedAdmin();
    await seedConfig();
    await seedProducts();
};
initDB();

// ── Default Home Route ────────────────────────────────────────────────────────
app.get('/', (req: Request, res: Response) => {
    res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1 style="color: #166534;">🌱 Danphe Organic API is Running!</h1>
      <p style="color: #4b5563;">You have successfully started the backend server with MongoDB.</p>
    </div>
  `);
});

// ── Admin Auth ────────────────────────────────────────────────────────────────
app.post('/api/auth/admin/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, role: 'admin' });

        if (user && bcrypt.compareSync(password, user.password || '')) {
            return res.json({ success: true, admin: { id: user._id, username: user.username, name: user.name, role: 'admin', avatar: user.avatar } });
        }
        return res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ── User Auth Routes ──────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req: Request, res: Response) => {
    const { name, username, password, phone, email } = req.body;
    if (!name || !username || !password) return res.status(400).json({ success: false, error: 'Name, username, and password are required.' });

    try {
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ success: false, error: 'Username already exists.' });

        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = new User({ name, username, password: hashedPassword, phone, email });
        await user.save();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { id: user._id, name, username, phone, email, avatar: user.avatar } });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, error: 'Username and password are required.' });

    try {
        const user = await User.findOne({ username });
        if (!user || !bcrypt.compareSync(password, user.password || '')) {
            return res.status(401).json({ success: false, error: 'Invalid credentials.' });
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { id: user._id, name: user.name, username: user.username, phone: user.phone, email: user.email, avatar: user.avatar } });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/auth/social-login', async (req: Request, res: Response) => {
    const { email, name, profilePic } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            const username = email.split('@')[0] + Math.random().toString(36).substr(2, 4);
            user = new User({ name, username, email, avatar: profilePic, password: 'social-login-no-password' });
            await user.save();
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { id: user._id, name: user.name, username: user.username, avatar: user.avatar } });
    } catch (err: any) {
        console.error('Social Login Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Account Recovery Protocols ────────────────────────────────────────────────
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
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
    } catch (err: any) {
        res.status(500).json({ success: false, error: 'Protocol initiation failed.' });
    }
});

app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    try {
        const user = await User.findOne({ reset_token: token, token_expiry: { $gt: new Date() } });
        if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired protocol token.' });

        user.password = bcrypt.hashSync(newPassword, 10);
        user.reset_token = undefined;
        user.token_expiry = undefined;
        await user.save();

        res.json({ success: true, message: 'Identity restored successfully.' });
    } catch (err: any) {
        res.status(500).json({ success: false, error: 'Identity restoration failed.' });
    }
});

// ── User Management (MongoDB) ──────────────────────────────────────────
app.get('/api/users/count', async (req: Request, res: Response) => {
    try {
        const count = await User.countDocuments();
        res.json({ success: true, count });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/admin/users', async (req: Request, res: Response) => {
    try {
        const users = await User.find().lean();
        const result = await Promise.all(users.map(async user => {
            const orders = await Order.find({ user_id: user._id.toString() }).lean();
            return { ...user, id: user._id, orders };
        }));
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/admin/personnel', async (req: Request, res: Response) => {
    try {
        const rows = await User.find({ role: { $in: ['delivery', 'admin'] } }).select('name role _id').lean();
        res.json(rows.map(p => ({ ...p, id: p._id, status: 'Online', lastActive: new Date().toISOString() })));
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Shopping Cart Routes (Database) ──────────────────────────────────────────
app.get('/api/cart', auth, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
        res.json({ success: true, cart: user.cart || [] });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/cart/add', auth, async (req: AuthRequest, res: Response) => {
    const { productId, name, image, price, quantity } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

        const existingItem = user.cart.find((item: any) => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += (quantity || 1);
        } else {
            user.cart.push({ productId, name, image, price, quantity: quantity || 1 });
        }
        await user.save();
        res.json({ success: true, cart: user.cart });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.patch('/api/cart/update', auth, async (req: AuthRequest, res: Response) => {
    const { productId, quantity } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

        const item = user.cart.find((item: any) => item.productId === productId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                user.cart = user.cart.filter((i: any) => i.productId !== productId) as any;
            }
            await user.save();
        }
        res.json({ success: true, cart: user.cart });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/cart/remove/:productId', auth, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

        user.cart = user.cart.filter((item: any) => item.productId !== req.params.productId) as any;
        await user.save();
        res.json({ success: true, cart: user.cart });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/cart/clear', auth, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

        user.cart = [] as any;
        await user.save();
        res.json({ success: true, cart: [] });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});
app.get('/api', (req: Request, res: Response) => {
    res.json({ status: 'active', message: 'Danphe Organic API is running', version: '2.0.0' });
});

// ── Newsletter Subscription ───────────────────────────────────────────────────
app.post('/api/subscribe', async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, error: 'Valid email required' });
    }

    try {
        // Insert notification for admin/owner
        await Notification.create({
            title: 'New Newsletter Subscriber',
            message: `Identity ${email} has joined the movement.`,
            type: 'info'
        });

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
    } catch (err: any) {
        res.status(500).json({ success: false, error: 'Subscription failed' });
    }
});

// ── Product Routes (MongoDB) ────────────────────────────────────────────────
app.get('/api/products', async (req: Request, res: Response) => {
    try {
        const products = await Product.find().sort({ createdAt: 1 });
        res.json(products.map(p => {
            const doc = p.toObject();
            return {
                ...doc,
                id: p._id.toString(),
                likes: p.likes?.length || 0,
                rating: p.ratingAverage || 0,
                ratingCount: p.ratingCount || 0
            };
        }));
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/products', async (req: Request, res: Response) => {
    try {
        const { name, description, price, discountPrice, category, image, features, inStock, isFeatured } = req.body;
        if (!name || price === undefined || price === null || !category) return res.status(400).json({ success: false, error: 'Name, price, and category are required.' });

        const product = new Product({
            name, description, category, image,
            price: parseFloat(price),
            discountPrice: discountPrice ? parseFloat(discountPrice) : null,
            features: Array.isArray(features) ? features : (features?.split(',').map((f: string) => f.trim()).filter(Boolean) || []),
            inStock: inStock === undefined ? true : !!inStock,
            isFeatured: !!isFeatured
        });

        await product.save();
        res.json({ success: true, product: { ...product.toObject(), id: product._id.toString() } });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/products/:id', async (req: Request, res: Response) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
        if (!updatedProduct) return res.status(404).json({ success: false, error: 'Product not found.' });
        res.json({ success: true, product: { ...updatedProduct.toObject(), id: updatedProduct._id.toString() } });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ success: false, error: 'Product not found.' });
        res.json({ success: true, product: { ...deletedProduct.toObject(), id: deletedProduct._id.toString() } });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/products/:id/toggle-like', auth, async (req: AuthRequest, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, error: 'Product not found.' });

        // Defensive check: ensure likes array exists
        if (!Array.isArray(product.likes)) {
            product.likes = [];
        }

        const userId = req.userId!.toString();
        const likeIndex = product.likes.indexOf(userId);
        let isLiked = false;

        if (likeIndex > -1) {
            // Already liked, do nothing (or return error if strict, but ignoring is safer for simple UX)
            isLiked = true;
        } else {
            product.likes.push(userId);
            isLiked = true;
        }

        await product.save();

        const likesCount = product.likes.length;
        io.emit('product_likes_updated', { id: product._id.toString(), likes: likesCount });

        res.json({ success: true, isLiked, likes: likesCount });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Product Comments ────────────────────────────────────────────────────────
app.get('/api/products/:id/comments', async (req: Request, res: Response) => {
    try {
        const comments = await Comment.find({ productId: req.params.id }).sort({ timestamp: 1 });
        // Map field names to match frontend expectation (user_name vs userName)
        res.json(comments.map(c => ({
            text: c.text,
            isMotivational: c.isMotivational,
            user_name: c.userName,
            timestamp: c.timestamp
        })));
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/products/:id/comments', async (req: Request, res: Response) => {
    const { user_id, user_name, text, isMotivational } = req.body;
    if (!text || !user_name) return res.status(400).json({ success: false, error: 'Text and username are required.' });

    try {
        const comment = new Comment({
            productId: req.params.id,
            userId: user_id || 'guest',
            userName: user_name,
            text,
            isMotivational: !!isMotivational
        });
        await comment.save();
        res.json({ success: true, comment });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/products/:id/rate', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { value } = req.body;
        if (typeof value !== 'number' || value < 1 || value > 5) {
            return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5.' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, error: 'Product not found.' });

        const userId = req.userId!.toString();
        const existingRating = product.ratings.find(r => r.userId === userId);

        if (existingRating) {
            return res.status(400).json({ success: false, error: 'Rating already submitted and cannot be changed.' });
        } else {
            product.ratings.push({ userId, value });
        }

        // Recalculate average
        const total = product.ratings.reduce((sum, r) => sum + r.value, 0);
        product.ratingCount = product.ratings.length;
        product.ratingAverage = parseFloat((total / product.ratingCount).toFixed(1));

        await product.save();

        io.emit('product_rating_updated', {
            id: product._id.toString(),
            rating: product.ratingAverage,
            ratingCount: product.ratingCount
        });

        res.json({
            success: true,
            rating: product.ratingAverage,
            ratingCount: product.ratingCount
        });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/user/interactions', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!.toString();
        const products = await Product.find({
            $or: [
                { likes: userId },
                { "ratings.userId": userId }
            ]
        });

        const likes = products
            .filter(p => p.likes.includes(userId))
            .map(p => p._id.toString());

        const ratings: { [productId: string]: number } = {};
        products.forEach(p => {
            const r = p.ratings.find(rat => rat.userId === userId);
            if (r) ratings[p._id.toString()] = r.value;
        });

        res.json({ success: true, likes, ratings });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/featured/view', async (req: Request, res: Response) => {
    try {
        await Notification.create({
            title: 'Featured Page View',
            message: 'A user is reviewing your Featured Products page.',
            type: 'info'
        });
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Payment Routes (Traditional/Manual) ──────────────────────────────────────
app.post('/api/payments/traditional', async (req: Request, res: Response) => {
    const { orderId, paymentMethod, amount, transactionId } = req.body;

    if (!orderId || !amount) {
        return res.status(400).json({ success: false, error: 'Order ID and amount are required.' });
    }

    try {
        const order = await Order.findOne({ id: orderId });
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found.' });
        }

        // Update order status to 0 (Confirmed/Paid)
        // Traditional payments usually require manual verification, 
        // but here we mark it confirmed to advance the workflow.
        order.status = 0;
        await order.save();

        // Create a notification for the admin
        await Notification.create({
            title: 'Payment Received',
            message: `Traditional payment of ${amount} confirmed for Order #ORD-${orderId} via ${paymentMethod || 'Manual'}. Reference: ${transactionId || 'N/A'}`,
            type: 'info'
        });

        res.json({
            success: true,
            message: 'Payment processed and order confirmed.'
        });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Order Routes (MongoDB) ──────────────────────────────────────────────────────
app.post('/api/orders', async (req: Request, res: Response) => {
    const { id, customerName, productName, price, address, phone, user_id, location } = req.body;

    try {
        const order = await Order.create({
            id: id || Math.random().toString(36).substring(7).toUpperCase(),
            customerName,
            productName,
            price,
            address,
            phone,
            user_id: user_id || null,
            status: -1,
            location: location || "In Processing"
        });

        // Create a notification for the admin
        await Notification.create({
            title: 'New Order Inbound',
            message: `Order #ORD-${order.id} received from ${customerName}`,
            type: 'order'
        });

        res.json({ success: true, order: { ...order.toObject(), id: order.id } });
    } catch (err: any) {
        res.status(500).json({ success: false, error: 'Could not create order: ' + err.message });
    }
});

app.get('/api/users/:userId/orders', async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const rows = await Order.find({ user_id: userId }).sort({ timestamp: -1 });
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/orders', async (req: Request, res: Response) => {
    try {
        const rows = await Order.find().sort({ timestamp: -1 });
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, location } = req.body;

    try {
        const updateData: any = { status };
        if (location) updateData.location = location;

        const order = await Order.findOneAndUpdate({ id }, updateData, { new: true });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found.' });

        // Notification for status change
        const statusLabels = ["Confirmed", "Prepared", "Shipping", "Completed"];
        const label = status >= 0 && status < statusLabels.length ? statusLabels[status] : "Updated";
        await Notification.create({
            title: 'Status Update',
            message: `Order #ORD-${id} status changed to ${label}`,
            type: 'info'
        });

        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Notification Routes ───────────────────────────────────────────────────────
app.get('/api/admin/notifications', async (req: Request, res: Response) => {
    try {
        const rows = await Notification.find().sort({ created_at: -1 }).limit(50);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/admin/notifications/read', async (req: Request, res: Response) => {
    const { ids } = req.body; // Array of notification IDs
    try {
        if (ids && ids.length > 0) {
            await Notification.updateMany({ _id: { $in: ids } }, { read: true });
        } else {
            await Notification.updateMany({}, { read: true });
        }
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── System Config Routes ──────────────────────────────────────────────────────
app.get('/api/admin/config', async (req: Request, res: Response) => {
    try {
        const rows = await SystemConfig.find();
        const config: any = {};
        rows.forEach(r => config[r.key] = r.value);
        res.json(config);
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/admin/config', async (req: Request, res: Response) => {
    const updates = req.body; // e.g., { store_name: 'New Name', ... }
    try {
        for (const [key, value] of Object.entries(updates)) {
            await SystemConfig.findOneAndUpdate({ key }, { value: String(value) }, { upsert: true });
        }
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Global Error Shield ───────────────────────────────────────────────────────
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('\x1b[31m[CRITICAL PROTOCOL FAILURE]\x1b[0m', err.stack);
    res.status(500).json({ success: false, error: 'Internal system fault', stack: err.message });
});

process.on('uncaughtException', (err) => {
    console.error('\x1b[31m[FATAL UNCAUGHT EXCEPTION]\x1b[0m', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\x1b[31m[FATAL UNHANDLED REJECTION]\x1b[0m', reason);
});

// ── Socket.io Connection Logic ───────────────────────────────────────────────
io.on('connection', (socket: Socket) => {
    activeVisitors++;
    io.emit('visitor_count_update', { count: activeVisitors });
    console.log(`[SOCKET] Physical presence detected: ${socket.id} (Total: ${activeVisitors})`);

    // Admin joins the secure admin room
    socket.on('join_admin', async () => {
        socket.join('adminRoom');
        console.log(`[SOCKET] Admin joined adminRoom: ${socket.id}`);

        try {
            // Fetch all sessions from database
            const sessions = await ChatSession.find().sort({ lastActive: -1 });
            const activeChatSessions: any = {};

            for (const session of sessions) {
                const messages = await ChatMessage.find({ userId: session.userId }).sort({ timestamp: 1 });
                activeChatSessions[session.userId] = {
                    userId: session.userId,
                    userName: session.userName,
                    socketId: session.socketId,
                    lastActive: session.lastActive,
                    messages: messages.map(m => ({
                        id: m._id,
                        text: m.text,
                        isUser: m.isUser,
                        timestamp: m.timestamp
                    }))
                };
            }

            socket.emit('sync_sessions', activeChatSessions);
        } catch (err) {
            console.error("Error syncing sessions:", err);
        }
    });

    // User identifies themselves upon connection
    socket.on('user_identify', async (data) => {
        console.log(`[SOCKET] User identity received: ${data.userName} (${data.userId})`);
        socketToUser.set(socket.id, data.userId);
        const timestamp = new Date();

        try {
            await ChatSession.findOneAndUpdate(
                { userId: data.userId },
                { userName: data.userName, socketId: socket.id, lastActive: timestamp },
                { upsert: true, new: true }
            );

            // Notify admins that this user is online
            io.to('adminRoom').emit('update_user_status', {
                userId: data.userId,
                userName: data.userName,
                socketId: socket.id,
                lastActive: timestamp.toISOString(),
                isOnline: true
            });

            // Send history back to the user
            const messages = await ChatMessage.find({ userId: data.userId }).sort({ timestamp: 1 });
            socket.emit('chat_history', messages.map(m => ({
                id: m._id,
                text: m.text,
                isUser: m.isUser,
                timestamp: m.timestamp
            })));
        } catch (err) {
            console.error("Error identifying user:", err);
        }
    });

    // Handle incoming messages from users
    socket.on('user_message', async (data) => {
        console.log(`[SOCKET] User message from ${data.userId || 'Guest'}: ${data.text}`);
        const timestamp = new Date();
        const userName = data.userName || 'Guest';

        try {
            await ChatSession.findOneAndUpdate(
                { userId: data.userId },
                { userName, socketId: socket.id, lastActive: timestamp },
                { upsert: true }
            );

            await ChatMessage.create({
                userId: data.userId,
                text: data.text,
                isUser: true,
                timestamp
            });

            // Broadcast to admins
            io.to('adminRoom').emit('user_message', {
                ...data,
                socketId: socket.id,
                timestamp: timestamp.toISOString()
            });
        } catch (err) {
            console.error("Error saving user message:", err);
        }
    });

    // Handle replies from admin to a specific user
    socket.on('admin_message', async (data) => {
        console.log(`[SOCKET] Admin reply to ${data.targetSocketId}: ${data.text}`);
        const timestamp = new Date();
        const userId = data.userId;

        if (userId) {
            try {
                await ChatSession.findOneAndUpdate({ userId }, { lastActive: timestamp });
                await ChatMessage.create({
                    userId,
                    text: data.text,
                    isUser: false,
                    timestamp
                });

                // Broadcast the reply to ALL admins
                io.to('adminRoom').emit('admin_message_received', {
                    userId: userId,
                    text: data.text,
                    timestamp: timestamp.toISOString()
                });
            } catch (err) {
                console.error("Error saving admin message:", err);
            }
        }

        if (data.targetSocketId) {
            io.to(data.targetSocketId).emit('admin_reply', {
                text: data.text,
                timestamp: timestamp.toISOString()
            });
        }
    });

    socket.on('disconnect', () => {
        activeVisitors = Math.max(0, activeVisitors - 1);
        io.emit('visitor_count_update', { count: activeVisitors });
        console.log(`[SOCKET] Presence lost: ${socket.id} (Total: ${activeVisitors})`);
        
        const userId = socketToUser.get(socket.id);
        if (userId) {
            console.log(`[SOCKET] User offline: ${userId}`);
            socketToUser.delete(socket.id);
            io.to('adminRoom').emit('update_user_status', {
                userId: userId,
                isOnline: false
            });
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`API check: http://localhost:${PORT}/api/products`);
    console.log(`Admin login: username="${ADMIN_USERNAME}", password="${ADMIN_PASSWORD}"`);
});
