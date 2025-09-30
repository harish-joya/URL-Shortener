// Temporary route to create admin user (remove after use)
const User = require('../models/user');

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