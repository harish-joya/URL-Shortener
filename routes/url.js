const express = require("express");
const router = express.Router();
const {handlePostNewShortUrl,
        handleGetUrlById,
        handleGetAnalyticsById} = require("../controllers/url");
const { restrictToLoggedInUserOnly } = require("../middleware/auth");

// Public routes - no authentication required
router.get("/:shortId", handleGetUrlById);

// Protected routes - authentication required
router.post("/", restrictToLoggedInUserOnly, handlePostNewShortUrl);
router.get("/analytics/:shortId", restrictToLoggedInUserOnly, handleGetAnalyticsById);

module.exports = router;