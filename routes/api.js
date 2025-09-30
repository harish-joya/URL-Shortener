const express = require('express');
const router = express.Router();
const { restrictToLoggedInUserOnly, checkAuth } = require('../middleware/auth');
const URL = require('../models/url');

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
    
    const urls = await URL.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ urls });
  } catch (error) {
    console.error('Admin URLs error:', error);
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
});

// Logout
router.post('/auth/logout', (req, res) => {
  res.clearCookie('uid');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;