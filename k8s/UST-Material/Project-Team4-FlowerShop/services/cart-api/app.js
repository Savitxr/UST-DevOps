/**
 * CART-API MICROSERVICE
 * Handles: Cart operations, Orders, Customization
 * Network: backend-net + db-net
 * Port: 3003
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/AFF-Docker';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('[CART-API] Connected to MongoDB'))
  .catch(err => console.error('[CART-API] MongoDB connection error:', err));

// ─────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String }
}, { timestamps: true });

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 }
  }],
  totalPrice: { type: Number, default: 0 }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number }
  }],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'pending' }
}, { timestamps: true });

const customizationSchema = new mongoose.Schema({
  flowerTypes: [{ type: String }],
  message: { type: String },
  wrapColor: { type: String },
  totalPrice: { type: Number }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
const Cart = mongoose.model('Cart', cartSchema);
const Order = mongoose.model('Order', orderSchema);
const Customization = mongoose.model('Customization', customizationSchema);

// Fixed user ID for demo (in production, get from auth token)
const FIXED_USER_ID = new mongoose.Types.ObjectId('66c9b077eb71fd1746d0f65d');

// ─────────────────────────────────────────────────────────────
// CART ROUTES
// ─────────────────────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cart-api' });
});

// GET /api/cart - Get cart contents
app.get('/api/cart', async (req, res) => {
  try {
    const userId = req.query.userId || FIXED_USER_ID;
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (cart) {
      res.json({
        success: true,
        cart: {
          items: cart.items.map(item => ({
            product: item.productId,
            quantity: item.quantity
          })),
          totalPrice: cart.totalPrice
        }
      });
    } else {
      res.json({ success: true, cart: { items: [], totalPrice: 0 } });
    }
  } catch (err) {
    console.error('[CART-API] Error fetching cart:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/cart/add - Add item to cart
app.post('/api/cart/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.body.userId || FIXED_USER_ID;
    const qty = parseInt(quantity, 10);

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0 });
    }

    const itemIndex = cart.items.findIndex(item => 
      item.productId && item.productId.equals(productId)
    );
    
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += qty;
    } else {
      cart.items.push({ productId, quantity: qty });
    }

    // Recalculate total
    await cart.populate('items.productId');
    cart.totalPrice = cart.items.reduce((total, item) => {
      if (item.productId && item.productId.price) {
        return total + (item.quantity * item.productId.price);
      }
      return total;
    }, 0);

    await cart.save();
    res.json({ success: true, message: 'Product added to cart', cart });
  } catch (err) {
    console.error('[CART-API] Error adding to cart:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/cart/clear - Clear cart
app.delete('/api/cart/clear', async (req, res) => {
  try {
    const userId = req.body.userId || FIXED_USER_ID;
    await Cart.findOneAndUpdate({ userId }, { items: [], totalPrice: 0 });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// ORDER ROUTES
// ─────────────────────────────────────────────────────────────

// POST /api/orders - Place order from cart
app.post('/api/orders', async (req, res) => {
  try {
    const userId = req.body.userId || FIXED_USER_ID;
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const newOrder = new Order({
      userId,
      products: cart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity
      })),
      totalPrice: cart.totalPrice
    });

    await newOrder.save();

    // Clear cart after order
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({ success: true, message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    console.error('[CART-API] Error placing order:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/orders - Get user orders
app.get('/api/orders', async (req, res) => {
  try {
    const userId = req.query.userId || FIXED_USER_ID;
    const orders = await Order.find({ userId }).populate('products.productId');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// CUSTOMIZATION ROUTES
// ─────────────────────────────────────────────────────────────

// POST /api/customization - Save customization order
app.post('/api/customization', async (req, res) => {
  try {
    const { flowerTypes, message, wrapColor, totalPrice } = req.body;
    
    const newCustomization = new Customization({
      flowerTypes: Array.isArray(flowerTypes) ? flowerTypes : [flowerTypes],
      message,
      wrapColor,
      totalPrice: parseFloat(totalPrice) || 0
    });
    
    await newCustomization.save();
    res.status(201).json({ success: true, message: 'Customization saved', customization: newCustomization });
  } catch (err) {
    console.error('[CART-API] Customization error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CART-API] Running on port ${PORT}`);
  console.log(`[CART-API] MongoDB: ${MONGO_URI}`);
});
