const User = require("../models/user");
const { nanoid } = require("nanoid");
const URL = require("../models/url");
const { setUser, getUser } = require("../service/auth");

// Generate custom short ID
function generateShortId() {
  return nanoid(6);
}

async function handlePostNewShortUrl(req, res) {
  try {
    const body = req.body;
    if (!body.url) return res.status(400).json({ error: "URL is required" });

    // Check if URL already exists for the user
    const existing = await URL.findOne({
      redirectURl: body.url,
      createdBy: req.user._id,
    });

    if (existing) {
      const urls = await URL.find({ createdBy: req.user._id });
      return res.json({
        id: existing.shortId,
        urls,
        message: "URL already shortened"
      });
    }

    // If not existing, create a new short URL
    const shortId = generateShortId();

    await URL.create({
      shortId,
      redirectURl: body.url,
      visitHistory: [],
      createdBy: req.user._id,
    });

    const urls = await URL.find({ createdBy: req.user._id });

    return res.json({
      id: shortId,
      urls,
      message: "URL shortened successfully"
    });
  } catch (error) {
    console.error("Error creating short URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function handleGetUrlById(req, res) {
  try {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
      shortId
    }, {
      $push: {
        visitHistory: {
          timeStamp: Date.now(),
        }
      },
    });

    if (!entry) {
      return res.status(404).send(`
        <html>
          <head>
            <title>URL Not Found</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%); color: white; }
              .container { background: white; padding: 40px; border-radius: 15px; color: #333; max-width: 500px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
              h1 { color: #e53e3e; margin-bottom: 20px; }
              a { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
              a:hover { background: #ff5252; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Short URL Not Found</h1>
              <p>The short URL <strong>"${shortId}"</strong> doesn't exist.</p>
              <p>Please check the URL or create a new one.</p>
              <a href="http://localhost:3001">Go to URL Shortener</a>
            </div>
          </body>
        </html>
      `);
    }
    
    res.redirect(entry.redirectURl);
  } catch (error) {
    console.error("Error redirecting:", error);
    res.status(500).send("Server error");
  }
}

async function handleGetAnalyticsById(req, res) {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId });

  if (!result) return res.status(404).json({ error: "Short URL not found" });

  res.json({
    TotalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}

module.exports = {
  handlePostNewShortUrl,
  handleGetUrlById,
  handleGetAnalyticsById
};