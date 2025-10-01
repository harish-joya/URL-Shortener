// require('dotenv').config();
// const express = require("express");
// const app = express();
// const PORT = process.env.PORT || 10000;
// const path = require("path");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");

// // Basic middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' 
//     ? process.env.CLIENT_URL 
//     : 'http://localhost:3001',
//   credentials: true
// }));

// // Health check route
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', message: 'Server is running' });
// });

// // Test route
// app.get('/api/test', (req, res) => {
//   res.json({ message: 'API is working!' });
// });

// // Debug route loading
// console.log('Checking for route issues...');

// // Test each route file individually
// try {
//   console.log('Testing url routes...');
//   require("./routes/url");
//   console.log('✓ URL routes OK');
// } catch (e) {
//   console.error('✗ URL routes error:', e.message);
// }

// try {
//   console.log('Testing user routes...');
//   require("./routes/user");
//   console.log('✓ User routes OK');
// } catch (e) {
//   console.error('✗ User routes error:', e.message);
// }

// try {
//   console.log('Testing api routes...');
//   require("./routes/api");
//   console.log('✓ API routes OK');
// } catch (e) {
//   console.error('✗ API routes error:', e.message);
// }

// // Load routes after debugging
// console.log('Loading routes for application...');
// try {
//   const urlRoute = require("./routes/url");
//   app.use("/api/url", urlRoute);

//   const userRoute = require("./routes/user");
//   app.use("/api/user", userRoute);

//   const apiRoutes = require("./routes/api");
//   app.use("/api", apiRoutes);

//   console.log('✓ All routes loaded successfully');
// } catch (error) {
//   console.error('✗ Error loading routes:', error);
//   // Don't exit in production, just log the error
//   if (process.env.NODE_ENV === 'production') {
//     console.log('Continuing without some routes...');
//   } else {
//     process.exit(1);
//   }
// }

// // Serve static files from React in production
// if (process.env.NODE_ENV === 'production') {
//   console.log('Setting up static file serving for React...');
  
//   const frontendPath = path.join(__dirname, 'frontend/dist');
//   const fs = require('fs');
  
//   if (fs.existsSync(frontendPath)) {
//     app.use(express.static(frontendPath));
    
//     // Handle React routing
//     app.get('*', (req, res) => {
//       res.sendFile(path.join(frontendPath, 'index.html'));
//     });
//     console.log('✓ React frontend will be served');
//   } else {
//     console.log('✗ React build not found, serving API only');
//     app.get('/', (req, res) => {
//       res.json({ 
//         message: 'URL Shortener API - React frontend not built',
//         endpoints: {
//           health: '/health',
//           test: '/api/test',
//           register: '/api/user',
//           login: '/api/user/login'
//         }
//       });
//     });
//   }
// } else {
//   // In development
//   app.get('/', (req, res) => {
//     res.json({ 
//       message: 'URL Shortener API', 
//       frontend: 'Run frontend separately on http://localhost:3001',
//       endpoints: {
//         health: '/health',
//         test: '/api/test',
//         register: '/api/user',
//         login: '/api/user/login'
//       }
//     });
//   });
// }

// // MongoDB connection
// const connectToMongoDb = require("./connection");
// const MONGODB_URI = process.env.MONGO_URL;

// if (MONGODB_URI && (MONGODB_URI.startsWith('mongodb://') || MONGODB_URI.startsWith('mongodb+srv://'))) {
//   console.log("Connecting to MongoDB...");
//   connectToMongoDb(MONGODB_URI)
//     .then(() => console.log("✓ MongoDB connected successfully"))
//     .catch(err => {
//       console.error("✗ MongoDB connection failed:", err.message);
//     });
// } else {
//   console.log("⚠️ MongoDB URI not provided or invalid");
// }

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({ 
//     error: process.env.NODE_ENV === 'production' 
//       ? 'Something went wrong!' 
//       : err.message 
//   });
// });

// // 404 handler for API routes
// app.use('/api/*', (req, res) => {
//   res.status(404).json({ error: 'API route not found' });
// });

// // Catch-all handler for React routes (in production)
// if (process.env.NODE_ENV === 'production') {
//   app.get('*', (req, res) => {
//     const frontendPath = path.join(__dirname, 'frontend/dist/index.html');
//     const fs = require('fs');
//     if (fs.existsSync(frontendPath)) {
//       res.sendFile(frontendPath);
//     } else {
//       res.json({ error: 'Route not found and frontend not available' });
//     }
//   });
// } else {
//   app.use('*', (req, res) => {
//     res.status(404).json({ error: 'Route not found' });
//   });
// }

// app.listen(PORT, () => console.log(`✓ Server Started at PORT = ${PORT}`));
// console.log(`✓ Server is running in ${process.env.NODE_ENV || 'development'} mode`);


require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fs = require("fs");

// PORT
const PORT = process.env.PORT || 10000;

// -------------------- MIDDLEWARE --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : 'http://localhost:3001',
  credentials: true
}));

// -------------------- HEALTH & TEST ROUTES --------------------
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// -------------------- DEBUG ROUTES --------------------
console.log('Checking route files...');

['url', 'user', 'api'].forEach(routeFile => {
  try {
    require(`./routes/${routeFile}`);
    console.log(`✓ ${routeFile} routes OK`);
  } catch (e) {
    console.error(`✗ ${routeFile} routes error:`, e.message);
  }
});

// -------------------- LOAD ROUTES --------------------
try {
  const urlRoute = require("./routes/url");
  app.use("/api/url", urlRoute);

  const userRoute = require("./routes/user");
  app.use("/api/user", userRoute);

  const apiRoutes = require("./routes/api");
  app.use("/api", apiRoutes);

  console.log('✓ All routes loaded successfully');
} catch (error) {
  console.error('✗ Error loading routes:', error);
  if (process.env.NODE_ENV !== 'production') process.exit(1);
}

// -------------------- MONGODB CONNECTION --------------------
const connectToMongoDb = require("./connection");
const MONGODB_URI = process.env.MONGO_URL;

if (MONGODB_URI && (MONGODB_URI.startsWith('mongodb://') || MONGODB_URI.startsWith('mongodb+srv://'))) {
  console.log("Connecting to MongoDB...");
  connectToMongoDb(MONGODB_URI)
    .then(() => console.log("✓ MongoDB connected successfully"))
    .catch(err => console.error("✗ MongoDB connection failed:", err.message));
} else {
  console.log("⚠️ MongoDB URI not provided or invalid");
}

// -------------------- STATIC FILE SERVING (REACT) --------------------
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, 'frontend/dist');

  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    console.log('✓ React frontend will be served');

    // Catch-all for React router
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  } else {
    console.log('✗ React build not found, serving API only');
    app.get('/', (req, res) => {
      res.json({
        message: 'URL Shortener API - React frontend not built',
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
  // Development message
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

// -------------------- ERROR HANDLING --------------------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

// 404 for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// 404 for everything else in dev
if (process.env.NODE_ENV !== 'production') {
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// -------------------- START SERVER --------------------
app.listen(PORT, () => console.log(`✓ Server started on PORT = ${PORT} in ${process.env.NODE_ENV || 'development'} mode`));
