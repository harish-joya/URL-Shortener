require('dotenv').config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Try to load routes one by one
console.log('Testing route loading...');

try {
  console.log('Loading url routes...');
  const urlRoute = require("./routes/url");
  app.use("/api/url", urlRoute);
  console.log('✓ URL routes loaded successfully');
} catch (error) {
  console.error('✗ Error loading URL routes:', error.message);
}

try {
  console.log('Loading user routes...');
  const userRoute = require("./routes/user");
  app.use("/api/user", userRoute);
  console.log('✓ User routes loaded successfully');
} catch (error) {
  console.error('✗ Error loading user routes:', error.message);
}

try {
  console.log('Loading API routes...');
  const apiRoutes = require("./routes/api");
  app.use("/api", apiRoutes);
  console.log('✓ API routes loaded successfully');
} catch (error) {
  console.error('✗ Error loading API routes:', error.message);
}

// Serve static files from React in production
if (process.env.NODE_ENV === 'production') {
  console.log('Setting up static file serving for React...');
  
  // Serve static files from the frontend build directory
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    console.log('Serving React app for:', req.path);
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  });
} else {
  // In development, just provide a message
  app.get('/', (req, res) => {
    res.json({ 
      message: 'URL Shortener API', 
      frontend: 'Run frontend separately on http://localhost:3001',
      endpoints: {
        health: '/health',
        test: '/api/test',
        register: '/api/user',
        login: '/api/user/login'
      }
    });
  });
}

// MongoDB connection
const connectToMongoDb = require("./connection");
const MONGODB_URI = process.env.MONGO_URL;

if (MONGODB_URI && (MONGODB_URI.startsWith('mongodb://') || MONGODB_URI.startsWith('mongodb+srv://'))) {
  console.log("Connecting to MongoDB...");
  connectToMongoDb(MONGODB_URI)
    .then(() => console.log("MongoDB Atlas connected successfully"))
    .catch(err => {
      console.error("MongoDB connection failed:", err.message);
      console.log("Application will run in limited mode without database");
    });
} else {
  console.log("MongoDB URI not provided or invalid, running without database");
}

app.listen(PORT, () => console.log(`Server Started at PORT = ${PORT}`));