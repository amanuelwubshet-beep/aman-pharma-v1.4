const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data store
const store = {
  users: [
    { id: 1, name: 'Wubshet', email: 'wubshet@amanpharma.com', password: hashPassword('admin123'), role: 'admin', joined: '2024-01-01' },
    { id: 2, name: 'Aman', email: 'aman@amanpharma.com', password: hashPassword('user123'), role: 'user', joined: '2024-06-15' },
    { id: 3, name: 'Priya Patel', email: 'priya@gmail.com', password: hashPassword('user123'), role: 'user', joined: '2025-01-10' }
  ],
  products: [
    { id: 1, name: 'Amoxicillin 500mg', category: 'antibiotics', price: 250, originalPrice: 320, stock: 150, description: 'Broad-spectrum antibiotic for bacterial infections', badge: 'Popular', icon: '💊' },
    { id: 2, name: 'Paracetamol 650mg', category: 'pain-relief', price: 80, originalPrice: 100, stock: 500, description: 'Effective fever reducer and pain reliever', badge: 'Best Seller', icon: '💊' },
    { id: 3, name: 'Vitamin D3 1000IU', category: 'supplements', price: 350, originalPrice: 450, stock: 200, description: 'Essential vitamin for bone health and immunity', badge: 'New', icon: '🌿' },
    { id: 4, name: 'Cetirizine 10mg', category: 'allergy', price: 120, originalPrice: 150, stock: 300, description: '24-hour antihistamine for allergy relief', badge: '', icon: '🤧' },
    { id: 5, name: 'Omeprazole 20mg', category: 'gastro', price: 180, originalPrice: 220, stock: 180, description: 'Proton pump inhibitor for acid reflux', badge: '', icon: '🫁' },
    { id: 6, name: 'Metformin 500mg', category: 'diabetes', price: 150, originalPrice: 200, stock: 250, description: 'First-line medication for type 2 diabetes', badge: 'Essential', icon: '💉' },
    { id: 7, name: 'Multivitamin Complex', category: 'supplements', price: 450, originalPrice: 550, stock: 120, description: 'Complete daily nutrition with 25+ vitamins', badge: 'Premium', icon: '🌟' },
    { id: 8, name: 'Ibuprofen 400mg', category: 'pain-relief', price: 90, originalPrice: 120, stock: 400, description: 'Anti-inflammatory pain relief', badge: '', icon: '💊' },
    { id: 9, name: 'Azithromycin 250mg', category: 'antibiotics', price: 280, originalPrice: 350, stock: 100, description: 'Macrolide antibiotic for respiratory infections', badge: '', icon: '💊' },
    { id: 10, name: 'Calcium + Magnesium', category: 'supplements', price: 320, originalPrice: 400, stock: 170, description: 'Bone and muscle support formula', badge: '', icon: '🦴' },
    { id: 11, name: 'Cough Syrup AF', category: 'cold-flu', price: 140, originalPrice: 180, stock: 220, description: 'Fast-acting cough and cold relief', badge: 'Popular', icon: '🫗' },
    { id: 12, name: 'Pantoprazole 40mg', category: 'gastro', price: 200, originalPrice: 260, stock: 160, description: 'Gastric acid reducer for GERD treatment', badge: '', icon: '🫁' },
    { id: 13, name: 'Losartan 50mg', category: 'cardio', price: 190, originalPrice: 240, stock: 140, description: 'Blood pressure management medication', badge: 'Essential', icon: '❤️' },
    { id: 14, name: 'Atorvastatin 10mg', category: 'cardio', price: 220, originalPrice: 280, stock: 130, description: 'Cholesterol management tablet', badge: '', icon: '❤️' },
    { id: 15, name: 'Zinc 50mg', category: 'supplements', price: 180, originalPrice: 230, stock: 250, description: 'Immune system booster', badge: '', icon: '🛡️' },
    { id: 16, name: 'Dolo 650', category: 'pain-relief', price: 30, originalPrice: 40, stock: 1000, description: 'India\'s trusted paracetamol brand', badge: 'Best Seller', icon: '💊' },
    { id: 17, name: 'ORS Sachets x20', category: 'cold-flu', price: 60, originalPrice: 80, stock: 500, description: 'Oral rehydration salts for dehydration', badge: '', icon: '🧂' },
    { id: 18, name: 'Insulin Glargine', category: 'diabetes', price: 850, originalPrice: 1100, stock: 50, description: 'Long-acting insulin for diabetes management', badge: 'Premium', icon: '💉' }
  ],
  orders: [
    { id: 1001, userId: 2, items: [{ productId: 1, qty: 2 }, { productId: 3, qty: 1 }], total: 850, status: 'delivered', date: '2025-12-01', address: '123 Health Street, Mumbai' },
    { id: 1002, userId: 3, items: [{ productId: 2, qty: 5 }], total: 400, status: 'shipped', date: '2026-01-15', address: '45 Wellness Ave, Delhi' },
    { id: 1003, userId: 2, items: [{ productId: 7, qty: 1 }, { productId: 15, qty: 2 }], total: 810, status: 'processing', date: '2026-02-10', address: '123 Health Street, Mumbai' }
  ],
  messages: [
    { id: 1, name: 'Rahul Kumar', email: 'rahul@gmail.com', phone: '9876543210', subject: 'Bulk Order Inquiry', message: 'Looking to place a bulk order for our hospital.', date: '2026-01-20', read: false },
    { id: 2, name: 'Dr. Mehta', email: 'mehta@clinic.com', phone: '9123456789', subject: 'Partnership', message: 'Interested in becoming a distributor.', date: '2026-02-05', read: true }
  ],
  newsletters: [
    { email: 'sub1@gmail.com', date: '2026-01-01' },
    { email: 'sub2@yahoo.com', date: '2026-02-14' }
  ],
  nextUserId: 4,
  nextOrderId: 1004,
  nextMsgId: 3
};

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

// Simple token store
const tokens = {};

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !tokens[token]) return res.status(401).json({ error: 'Unauthorized' });
  req.user = tokens[token];
  next();
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

// ============ AUTH ROUTES ============
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (store.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already registered' });
  const user = { id: store.nextUserId++, name, email, phone: phone || '', password: hashPassword(password), role: 'user', joined: new Date().toISOString().split('T')[0] };
  store.users.push(user);
  const token = generateToken();
  tokens[token] = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = store.users.find(u => u.email === email && u.password === hashPassword(password));
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = generateToken();
  tokens[token] = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  delete tokens[token];
  res.json({ message: 'Logged out' });
});

// ============ PRODUCT ROUTES ============
app.get('/api/products', (req, res) => {
  let products = [...store.products];
  const { category, search, sort } = req.query;
  if (category && category !== 'all') products = products.filter(p => p.category === category);
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  if (sort === 'price-low') products.sort((a, b) => a.price - b.price);
  if (sort === 'price-high') products.sort((a, b) => b.price - a.price);
  if (sort === 'name') products.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ products });
});

app.get('/api/products/:id', (req, res) => {
  const product = store.products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
});

// ============ CART ROUTES ============
app.get('/api/cart', authMiddleware, (req, res) => {
  const user = store.users.find(u => u.id === req.user.id);
  res.json({ cart: user.cart || [] });
});

app.post('/api/cart/add', authMiddleware, (req, res) => {
  const { productId, qty } = req.body;
  const user = store.users.find(u => u.id === req.user.id);
  if (!user.cart) user.cart = [];
  const existing = user.cart.find(c => c.productId === productId);
  if (existing) {
    existing.qty += qty || 1;
  } else {
    user.cart.push({ productId, qty: qty || 1 });
  }
  res.json({ cart: user.cart });
});

app.put('/api/cart/update', authMiddleware, (req, res) => {
  const { productId, qty } = req.body;
  const user = store.users.find(u => u.id === req.user.id);
  if (!user.cart) user.cart = [];
  if (qty <= 0) {
    user.cart = user.cart.filter(c => c.productId !== productId);
  } else {
    const item = user.cart.find(c => c.productId === productId);
    if (item) item.qty = qty;
  }
  res.json({ cart: user.cart });
});

app.delete('/api/cart/remove/:productId', authMiddleware, (req, res) => {
  const user = store.users.find(u => u.id === req.user.id);
  if (!user.cart) user.cart = [];
  user.cart = user.cart.filter(c => c.productId !== parseInt(req.params.productId));
  res.json({ cart: user.cart });
});

// ============ ORDER ROUTES ============
app.post('/api/orders', authMiddleware, (req, res) => {
  const { address, paymentMethod } = req.body;
  const user = store.users.find(u => u.id === req.user.id);
  if (!user.cart || user.cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });
  let total = 0;
  user.cart.forEach(ci => {
    const prod = store.products.find(p => p.id === ci.productId);
    if (prod) total += prod.price * ci.qty;
  });
  const order = {
    id: store.nextOrderId++,
    userId: req.user.id,
    items: [...user.cart],
    total,
    status: 'processing',
    date: new Date().toISOString().split('T')[0],
    address: address || 'Not provided',
    paymentMethod: paymentMethod || 'cod'
  };
  store.orders.push(order);
  user.cart = [];
  res.json({ order });
});

app.get('/api/orders', authMiddleware, (req, res) => {
  let orders;
  if (req.user.role === 'admin') {
    orders = store.orders;
  } else {
    orders = store.orders.filter(o => o.userId === req.user.id);
  }
  res.json({ orders });
});

// ============ ADMIN ROUTES ============
app.get('/api/admin/stats', authMiddleware, adminMiddleware, (req, res) => {
  const totalRevenue = store.orders.reduce((s, o) => s + o.total, 0);
  res.json({
    totalUsers: store.users.filter(u => u.role === 'user').length,
    totalProducts: store.products.length,
    totalOrders: store.orders.length,
    totalRevenue,
    unreadMessages: store.messages.filter(m => !m.read).length,
    pendingOrders: store.orders.filter(o => o.status === 'processing').length
  });
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  const users = store.users.map(({ password, ...u }) => u);
  res.json({ users });
});

app.put('/api/admin/users/:id', authMiddleware, adminMiddleware, (req, res) => {
  const user = store.users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { name, email, role } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, (req, res) => {
  store.users = store.users.filter(u => u.id !== parseInt(req.params.id));
  res.json({ message: 'User deleted' });
});

app.post('/api/admin/products', authMiddleware, adminMiddleware, (req, res) => {
  const { name, category, price, originalPrice, stock, description, badge, icon } = req.body;
  const product = {
    id: Math.max(...store.products.map(p => p.id)) + 1,
    name, category, price, originalPrice: originalPrice || price, stock, description, badge: badge || '', icon: icon || '💊'
  };
  store.products.push(product);
  res.json({ product });
});

app.put('/api/admin/products/:id', authMiddleware, adminMiddleware, (req, res) => {
  const product = store.products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  Object.assign(product, req.body);
  res.json({ product });
});

app.delete('/api/admin/products/:id', authMiddleware, adminMiddleware, (req, res) => {
  store.products = store.products.filter(p => p.id !== parseInt(req.params.id));
  res.json({ message: 'Product deleted' });
});

app.put('/api/admin/orders/:id', authMiddleware, adminMiddleware, (req, res) => {
  const order = store.orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = req.body.status || order.status;
  res.json({ order });
});

app.get('/api/admin/messages', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ messages: store.messages });
});

app.put('/api/admin/messages/:id/read', authMiddleware, adminMiddleware, (req, res) => {
  const msg = store.messages.find(m => m.id === parseInt(req.params.id));
  if (msg) msg.read = true;
  res.json({ message: 'Marked as read' });
});

app.delete('/api/admin/messages/:id', authMiddleware, adminMiddleware, (req, res) => {
  store.messages = store.messages.filter(m => m.id !== parseInt(req.params.id));
  res.json({ message: 'Deleted' });
});

// ============ CONTACT / NEWSLETTER ============
app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message required' });
  store.messages.push({ id: store.nextMsgId++, name, email, phone: phone || '', subject: subject || '', message, date: new Date().toISOString().split('T')[0], read: false });
  res.json({ message: 'Message sent successfully' });
});

app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  if (store.newsletters.find(n => n.email === email)) return res.status(400).json({ error: 'Already subscribed' });
  store.newsletters.push({ email, date: new Date().toISOString().split('T')[0] });
  res.json({ message: 'Subscribed successfully' });
});

// ============ PAGE ROUTES ============
const pages = ['index', 'about', 'products', 'contact', 'store', 'cart', 'auth', 'admin'];
const routes = { '/': 'index.html', '/about': 'about.html', '/products': 'products.html', '/contact': 'contact.html', '/store': 'store.html', '/cart': 'cart.html', '/auth': 'auth.html', '/admin': 'admin.html' };

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'aman-pharma-v1.4', uptime: Math.floor(process.uptime()) });
});

Object.entries(routes).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', file));
  });
});

app.listen(PORT, () => {
  console.log(`Aman Pharma v1.4 running on http://localhost:${PORT}`);
});
