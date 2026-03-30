/**
 * AUTH-API MICROSERVICE
 * Handles: User registration, login, session validation
 * Network: backend-net + db-net
 * Port: 3001
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/AFF-Docker';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('[AUTH-API] Connected to MongoDB'))
  .catch(err => console.error('[AUTH-API] MongoDB connection error:', err));

// User Schema (embedded in this microservice)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// ─────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-api' });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    
    if (user) {
      res.json({ 
        success: true, 
        user: { id: user._id, username: user.username, email: user.email } 
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('[AUTH-API] Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    
    const newUser = new User({ username, password, email });
    await newUser.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      user: { id: newUser._id, username: newUser.username }
    });
  } catch (err) {
    console.error('[AUTH-API] Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/auth/user/:id
app.get('/api/auth/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[AUTH-API] Running on port ${PORT}`);
  console.log(`[AUTH-API] MongoDB: ${MONGO_URI}`);
});
