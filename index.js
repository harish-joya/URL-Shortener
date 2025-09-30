require('dotenv').config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Middleware
const {restrictToLoggedInUserOnly, checkAuth} = require("./middleware/auth");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// API Routes
const urlRoute = require("./routes/url");
const userRoute = require("./routes/user");
const apiRoutes = require("./routes/api");

app.use("/api/url", urlRoute);
app.use("/api/user", userRoute);
app.use("/api", apiRoutes);

// Serve static files from React in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  });
}

// Connection with MongoDB
const connectToMongoDb = require("./connection");
const MONGODB_URI = process.env.MONGO_URL;

console.log("Environment:", process.env.NODE_ENV);
console.log("Connecting to MongoDB...");

connectToMongoDb(MONGODB_URI)
    .then(()=> console.log("MongoDB Atlas connected successfully"))
    .catch(err => {
        console.error("MongoDB connection failed:", err.message);
    });

app.listen(PORT, ()=> console.log(`Server Started at PORT = ${PORT}`) );