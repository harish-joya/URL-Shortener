const express = require('express');
const router = express.Router();
const { restrictToLoggedInUserOnly, checkAuth } = require('../middleware/auth');
const URL = require('../models/url');
const User = require('../models/user');

// Get current user
router.get('/auth/me', checkAuth, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json({ user: req.user });
});

// Get user's URLs
router.get('/urls', restrictToLoggedInUserOnly, async (req, res) => {
  try {
    const urls = await URL.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ urls });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
});

// Get all URLs for admin
router.get('/admin/urls', restrictToLoggedInUserOnly, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const urls = await URL.find({}).populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.json({ urls });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
});

// Logout
router.post('/auth/logout', (req, res) => {
  res.clearCookie('uid');
  res.json({ message: 'Logged out successfully' });
});

// Temporary route to create admin user (remove after use)
router.post('/setup-admin', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@urlshortener.com' });
    if (existingAdmin) {
      return res.json({ 
        message: 'Admin user already exists', 
        user: {
          email: existingAdmin.email,
          role: existingAdmin.role
        }
      });
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@urlshortener.com',
      password: 'admin123',
      role: 'admin'
    });

    res.json({ 
      message: 'Admin user created successfully',
      user: {
        email: adminUser.email,
        role: adminUser.role
      },
      credentials: {
        email: 'admin@urlshortener.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Failed to create admin user: ' + error.message });
  }
});

module.exports = router;