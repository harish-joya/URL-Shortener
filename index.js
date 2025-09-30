require('dotenv').config();
console.log("PORT from .env:", process.env.PORT);
const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Middleware
const {restrictToLoggedInUserOnly, checkAuth} = require("./middleware/auth");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3001",
  credentials: true
}));

// API Routes
const urlRoute = require("./routes/url");
const userRoute = require("./routes/user");
const apiRoutes = require("./routes/api");

// FIX: Remove auth from URL routes to make redirection public
app.use("/api/url", urlRoute); // CHANGED: Removed restrictToLoggedInUserOnly
app.use("/api/user", userRoute);
app.use("/api", apiRoutes);

// Connection with MongoDB
const connectToMongoDb = require("./connection");
const MONGODB_URI = process.env.MONGO_URL;

console.log("Connecting to MongoDB...");

connectToMongoDb(MONGODB_URI)
    .then(()=> console.log("MongoDB Atlas connected successfully"))
    .catch(err => {
        console.error("MongoDB connection failed:", err.message);
        console.log("Please check your MONGO_URL in .env file");
    });

app.listen(PORT, ()=> console.log(`Server Started at PORT = ${PORT}`) );