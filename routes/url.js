const express = require("express");
const router = express.Router();
const {handlePostNewShortUrl,
        handleGetUrlById,
        handleGetAnalyticsById} = require("../controllers/url");
const { restrictToLoggedInUserOnly } = require("../middleware/auth");

// FIX: Make URL redirection public (no auth required)
router.get("/:shortId", handleGetUrlById);

// Protected routes (auth required)
router.post("/", restrictToLoggedInUserOnly, handlePostNewShortUrl);
router.get("/analytics/:shortId", restrictToLoggedInUserOnly, handleGetAnalyticsById);

module.exports = router;