require('dotenv').config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;
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

// Try to load routes one by one to find the problematic one
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

// MongoDB connection
const connectToMongoDb = require("./connection");
const MONGODB_URI = process.env.MONGO_URL;

if (MONGODB_URI) {
  connectToMongoDb(MONGODB_URI)
    .then(() => console.log("MongoDB Atlas connected successfully"))
    .catch(err => console.error("MongoDB connection failed:", err.message));
} else {
  console.log("MongoDB URI not provided, running without database");
}

app.listen(PORT, () => console.log(`Server Started at PORT = ${PORT}`));