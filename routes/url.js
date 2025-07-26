const express = require("express");
const router = express.Router();
const {handlePostNewShortUrl,
        handleGetUrlById,
        handleGetAnalyticsById} = require("../controllers/url");

router.post("/", handlePostNewShortUrl);

router.get("/:shortId", handleGetUrlById);

router.get("/analytics/:shortId", handleGetAnalyticsById);



module.exports = router;