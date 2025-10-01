const express = require("express");
const router = express.Router();
const {
  handlePostNewShortUrl,
  handleGetUrlById,
  handleGetAnalyticsById,
  handleGetUserUrls,
  handleGetDetailedAnalytics
} = require("../controllers/url");
const { restrictToLoggedInUserOnly } = require("../middleware/auth");

// Public routes
router.get("/:shortId", handleGetUrlById);

// Protected routes
router.post("/", restrictToLoggedInUserOnly, handlePostNewShortUrl);
router.get("/analytics/:shortId", restrictToLoggedInUserOnly, handleGetAnalyticsById);
router.get("/user/urls", restrictToLoggedInUserOnly, handleGetUserUrls);
router.get("/analytics/detailed/:shortId", restrictToLoggedInUserOnly, handleGetDetailedAnalytics);

module.exports = router;