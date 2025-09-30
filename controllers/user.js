const User = require("../models/user");
const {setUser} = require("../service/auth");

async function handleUserSignUp(req, res) {
  try {
    const { name, email, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // Create new user
    const user = await User.create({ 
      name, 
      email, 
      password 
    });

    // Generate JWT token
    const token = setUser(user);
    
    // Set cookie and return response
    res.cookie("uid", token, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: 'lax'
    });
    
    return res.status(201).json({ 
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: "User already exists with this email" });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ error: "Internal server error during signup" });
  }
}

async function handleUserlogin(req, res) {
  try {
    const { email, password, source } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if admin trying to access user route or vice versa
    if (source === "admin" && user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }

    const token = setUser(user);
    res.cookie("uid", token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      redirectTo: source === "admin" ? "/admin" : "/dashboard"
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
}

module.exports = {
  handleUserSignUp,
  handleUserlogin
};