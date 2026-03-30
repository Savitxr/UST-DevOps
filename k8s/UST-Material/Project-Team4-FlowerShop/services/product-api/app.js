/**
 * PRODUCT-API MICROSERVICE
 * Handles: Product listing, Seller registration
 * Network: backend-net + db-net
 * Port: 3002
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/AFF-Docker';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('[PRODUCT-API] Connected to MongoDB'))
  .catch(err => console.error('[PRODUCT-API] MongoDB connection error:', err));

// ─────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String }
}, { timestamps: true });

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  phone: { type: String },
  email: { type: String, required: true },
  residentialAddress: { type: String },
  farmAddress: { type: String },
  bankAccount: { type: String },
  ifscCode: { type: String },
  flowerTypes: { type: String }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
const Seller = mongoose.model('Seller', sellerSchema);

// ─────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'product-api' });
});

// GET /api/products - List all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, products });
  } catch (err) {
    console.error('[PRODUCT-API] Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/products/:id - Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json({ success: true, product });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/products - Add new product (for seeding/admin)
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, description, image } = req.body;
    const newProduct = new Product({ name, price, description, image });
    await newProduct.save();
    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/seller - Register new seller
app.post('/api/seller', async (req, res) => {
  try {
    const { 
      name, age, gender, phone, email, 
      residentialAddress, farmAddress, 
      bankAccount, ifscCode, flowerTypes 
    } = req.body;
    
    const newSeller = new Seller({
      name, age, gender, phone, email,
      residentialAddress, farmAddress,
      bankAccount, ifscCode, flowerTypes
    });
    
    await newSeller.save();
    res.status(201).json({ success: true, message: 'Seller registered successfully', seller: newSeller });
  } catch (err) {
    console.error('[PRODUCT-API] Seller registration error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/sellers - List all sellers
app.get('/api/sellers', async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.json({ success: true, sellers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// SEED DATA — Sample flowers for demo
// ─────────────────────────────────────────────────────────────

const sampleFlowers = [
  { name: 'Red Roses', price: 29.99, description: 'Classic romantic red roses, bouquet of 12' },
  { name: 'White Lilies', price: 34.99, description: 'Elegant white lilies, symbol of purity' },
  { name: 'Sunflowers', price: 19.99, description: 'Bright and cheerful sunflower bunch' },
  { name: 'Pink Tulips', price: 24.99, description: 'Fresh spring tulips in soft pink' },
  { name: 'Purple Orchids', price: 49.99, description: 'Exotic orchids for special occasions' },
  { name: 'Mixed Bouquet', price: 39.99, description: 'Colorful mix of seasonal flowers' },
  { name: 'Carnations', price: 14.99, description: 'Long-lasting carnations, assorted colors' },
  { name: 'Daisies', price: 12.99, description: 'Simple and sweet white daisies' }
];

// GET /api/seed — Seed database with sample flowers
app.get('/api/seed', async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      return res.json({ success: true, message: 'Database already has products', count });
    }
    
    await Product.insertMany(sampleFlowers);
    res.json({ success: true, message: 'Sample flowers added!', count: sampleFlowers.length });
  } catch (err) {
    console.error('[PRODUCT-API] Seed error:', err);
    res.status(500).json({ success: false, message: 'Seed failed' });
  }
});


// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[PRODUCT-API] Running on port ${PORT}`);
  console.log(`[PRODUCT-API] MongoDB: ${MONGO_URI}`);
});
