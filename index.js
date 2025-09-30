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

// Load routes with better error handling
console.log('Loading routes...');

const loadRoute = (routePath, routeName) => {
  try {
    const route = require(routePath);
    return route;
  } catch (error) {
    console.error(`✗ Error loading ${routeName}:`, error.message);
    // Return a basic router that shows error message
    const express = require('express');
    const errorRouter = express.Router();
    errorRouter.all('*', (req, res) => {
      res.status(500).json({ 
        error: `${routeName} route not available due to loading error`,
        message: error.message 
      });
    });
    return errorRouter;
  }
};

// Load and use routes
const urlRoute = loadRoute("./routes/url", "URL routes");
app.use("/api/url", urlRoute);

const userRoute = loadRoute("./routes/user", "User routes");
app.use("/api/user", userRoute);

const apiRoutes = loadRoute("./routes/api", "API routes");
app.use("/api", apiRoutes);

// Serve static files from React in production
if (process.env.NODE_ENV === 'production') {
  console.log('Setting up static file serving for React...');
  
  // Check if frontend build exists
  const frontendPath = path.join(__dirname, 'frontend/dist');
  const fs = require('fs');
  
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
    console.log('✓ React frontend will be served');
  } else {
    console.log('✗ React build not found, serving API only');
    app.get('/', (req, res) => {
      res.json({ 
        message: 'URL Shortener API - React frontend not built',
        instructions: 'The React frontend build files are missing',
        endpoints: {
          health: '/health',
          test: '/api/test',
          register: '/api/user',
          login: '/api/user/login'
        }
      });
    });
  }
} else {
  // In development
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
    });
} else {
  console.log("MongoDB URI not provided or invalid");
}

app.listen(PORT, () => console.log(`Server Started at PORT = ${PORT}`));