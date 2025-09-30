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

// Simple test routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.get('/api/simple', (req, res) => {
  res.json({ message: 'Simple route working' });
});

// Serve static files from React in production
if (process.env.NODE_ENV === 'production') {
  console.log('Setting up static file serving for React...');
  
  const frontendPath = path.join(__dirname, 'frontend/dist');
  const fs = require('fs');
  
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
    console.log('✓ React frontend will be served');
  } else {
    console.log('✗ React build not found');
    app.get('/', (req, res) => {
      res.json({ 
        message: 'URL Shortener API - React frontend not built',
        endpoints: {
          health: '/health',
          test: '/api/test',
          simple: '/api/simple'
        }
      });
    });
  }
} else {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'URL Shortener API - Development Mode',
      frontend: 'Run: cd frontend && npm run dev',
      endpoints: {
        health: '/health',
        test: '/api/test',
        simple: '/api/simple'
      }
    });
  });
}

// MongoDB connection (optional for now)
const MONGODB_URI = process.env.MONGO_URL;
if (MONGODB_URI && (MONGODB_URI.startsWith('mongodb://') || MONGODB_URI.startsWith('mongodb+srv://'))) {
  const connectToMongoDb = require("./connection");
  console.log("Connecting to MongoDB...");
  connectToMongoDb(MONGODB_URI)
    .then(() => console.log("MongoDB Atlas connected successfully"))
    .catch(err => console.error("MongoDB connection failed:", err.message));
} else {
  console.log("Running without MongoDB");
}

app.listen(PORT, () => console.log(`Server Started at PORT = ${PORT}`));