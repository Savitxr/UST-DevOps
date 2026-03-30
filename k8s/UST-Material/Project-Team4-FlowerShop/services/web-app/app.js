/**
 * WEB-APP SERVICE
 * Handles: Serving EJS views, proxying to microservices
 * Network: frontend-net + backend-net
 * Port: 3000
 * 
 * This service:
 * - Serves all HTML views (EJS templates)
 * - Calls auth-api, product-api, cart-api via internal network
 * - Handles session management
 */

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Microservice URLs (internal Docker network)
const AUTH_API = process.env.AUTH_API_URL || 'http://auth-api:3001';
const PRODUCT_API = process.env.PRODUCT_API_URL || 'http://product-api:3002';
const CART_API = process.env.CART_API_URL || 'http://cart-api:3003';

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session.user || null;
  next();
});

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'web-app' });
});

// ─────────────────────────────────────────────────────────────
// HOME & DASHBOARD
// ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  res.render('dashboard');
});

app.get('/thankyou', (req, res) => {
  res.render('thankyou');
});

app.get('/knowmore', (req, res) => {
  res.render('knowmore');
});

// ─────────────────────────────────────────────────────────────
// AUTH ROUTES (proxy to auth-api)
// ─────────────────────────────────────────────────────────────
app.get('/auth/login', (req, res) => {
  res.render('login');
});

app.post('/auth/login', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_API}/api/auth/login`, req.body);
    if (response.data.success) {
      req.session.user = response.data.user;
      req.flash('success_msg', 'You are now logged in');
      res.redirect('/dashboard');
    } else {
      req.flash('error_msg', 'Invalid credentials');
      res.redirect('/auth/login');
    }
  } catch (err) {
    console.error('[WEB-APP] Login error:', err.message);
    req.flash('error_msg', err.response?.data?.message || 'Login failed');
    res.redirect('/auth/login');
  }
});

app.get('/auth/signup', (req, res) => {
  res.render('signup');
});

app.post('/auth/signup', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_API}/api/auth/signup`, req.body);
    if (response.data.success) {
      req.flash('success_msg', 'You are now registered and can log in');
      res.redirect('/auth/login');
    } else {
      req.flash('error_msg', response.data.message);
      res.redirect('/auth/signup');
    }
  } catch (err) {
    console.error('[WEB-APP] Signup error:', err.message);
    req.flash('error_msg', err.response?.data?.message || 'Registration failed');
    res.redirect('/auth/signup');
  }
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// ─────────────────────────────────────────────────────────────
// PRODUCT ROUTES (proxy to product-api)
// ─────────────────────────────────────────────────────────────
app.get('/product', async (req, res) => {
  try {
    const response = await axios.get(`${PRODUCT_API}/api/products`);
    res.render('products', { products: response.data.products || [] });
  } catch (err) {
    console.error('[WEB-APP] Products error:', err.message);
    res.render('products', { products: [] });
  }
});

// ─────────────────────────────────────────────────────────────
// SELLER ROUTES (proxy to product-api)
// ─────────────────────────────────────────────────────────────
app.get('/seller', (req, res) => {
  res.render('seller');
});

app.post('/seller', async (req, res) => {
  try {
    const response = await axios.post(`${PRODUCT_API}/api/seller`, req.body);
    if (response.data.success) {
      req.flash('success_msg', 'Seller registered successfully!');
      res.redirect('/seller');
    } else {
      req.flash('error_msg', 'Registration failed');
      res.redirect('/seller');
    }
  } catch (err) {
    console.error('[WEB-APP] Seller error:', err.message);
    req.flash('error_msg', 'An error occurred');
    res.redirect('/seller');
  }
});

// ─────────────────────────────────────────────────────────────
// CART ROUTES (proxy to cart-api)
// ─────────────────────────────────────────────────────────────
app.get('/cart', async (req, res) => {
  try {
    const response = await axios.get(`${CART_API}/api/cart`);
    const cart = response.data.cart || { items: [], totalPrice: 0 };
    res.render('cart', { 
      cartDetails: cart.items, 
      totalPrice: cart.totalPrice 
    });
  } catch (err) {
    console.error('[WEB-APP] Cart error:', err.message);
    res.render('cart', { cartDetails: [], totalPrice: 0 });
  }
});

app.post('/cart/add', async (req, res) => {
  try {
    await axios.post(`${CART_API}/api/cart/add`, req.body);
    req.flash('success_msg', 'Product added to cart');
    res.redirect('/cart');
  } catch (err) {
    console.error('[WEB-APP] Add to cart error:', err.message);
    req.flash('error_msg', 'Failed to add product');
    res.redirect('/product');
  }
});

app.post('/cart/order', async (req, res) => {
  try {
    const response = await axios.post(`${CART_API}/api/orders`);
    if (response.data.success) {
      req.flash('success_msg', 'Order placed successfully!');
      res.redirect('/thankyou');
    } else {
      req.flash('error_msg', 'Order failed');
      res.redirect('/cart');
    }
  } catch (err) {
    console.error('[WEB-APP] Order error:', err.message);
    req.flash('error_msg', err.response?.data?.message || 'Order failed');
    res.redirect('/cart');
  }
});

// ─────────────────────────────────────────────────────────────
// CUSTOMIZATION ROUTES (proxy to cart-api)
// ─────────────────────────────────────────────────────────────
app.get('/customization', async (req, res) => {
  try {
    const response = await axios.get(`${PRODUCT_API}/api/products`);
    res.render('customization', { products: response.data.products || [] });
  } catch (err) {
    res.render('customization', { products: [] });
  }
});

app.post('/customization/place-order', async (req, res) => {
  try {
    await axios.post(`${CART_API}/api/customization`, req.body);
    req.flash('success_msg', 'Your order has been placed successfully!');
    res.redirect('/thankyou');
  } catch (err) {
    console.error('[WEB-APP] Customization error:', err.message);
    req.flash('error_msg', 'Order failed');
    res.redirect('/customization');
  }
});

// ─────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[WEB-APP] Running on port ${PORT}`);
  console.log(`[WEB-APP] Auth API: ${AUTH_API}`);
  console.log(`[WEB-APP] Product API: ${PRODUCT_API}`);
  console.log(`[WEB-APP] Cart API: ${CART_API}`);
});
