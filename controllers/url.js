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

// NEW ANALYTICS FUNCTIONS - Add these
async function handleGetUserUrls(req, res) {
  try {
    const urls = await URL.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .select('shortId redirectURl visitHistory createdAt');
    
    const urlsWithStats = urls.map(url => ({
      _id: url._id,
      shortId: url.shortId,
      shortUrl: `${req.headers.host}/api/url/${url.shortId}`,
      originalUrl: url.redirectURl,
      totalClicks: url.visitHistory.length,
      createdAt: url.createdAt,
      lastClicked: url.visitHistory.length > 0 
        ? new Date(Math.max(...url.visitHistory.map(v => v.timeStamp)))
        : null
    }));

    res.json({ urls: urlsWithStats });
  } catch (error) {
    console.error("Error fetching user URLs:", error);
    res.status(500).json({ error: "Failed to fetch URLs" });
  }
}

async function handleGetDetailedAnalytics(req, res) {
  try {
    const shortId = req.params.shortId;
    const url = await URL.findOne({ 
      shortId, 
      createdBy: req.user._id 
    });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    // Calculate click statistics
    const clicksByDate = {};
    const clicksByHour = new Array(24).fill(0);
    
    url.visitHistory.forEach(visit => {
      const date = new Date(visit.timeStamp).toLocaleDateString();
      const hour = new Date(visit.timeStamp).getHours();
      
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;
      clicksByHour[hour]++;
    });

    const analyticsData = {
      shortId: url.shortId,
      originalUrl: url.redirectURl,
      shortUrl: `${req.headers.host}/api/url/${url.shortId}`,
      totalClicks: url.visitHistory.length,
      createdAt: url.createdAt,
      clickData: {
        byDate: clicksByDate,
        byHour: clicksByHour,
        last7Days: getLast7DaysClicks(url.visitHistory),
        last30Days: getLast30DaysClicks(url.visitHistory)
      },
      recentClicks: url.visitHistory
        .slice(-10)
        .reverse()
        .map(visit => ({
          timestamp: new Date(visit.timeStamp),
          time: new Date(visit.timeStamp).toLocaleString()
        }))
    };

    res.json(analyticsData);
  } catch (error) {
    console.error("Error fetching detailed analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
}

// Helper functions
function getLast7DaysClicks(visitHistory) {
  const result = {};
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString();
    
    result[dateStr] = visitHistory.filter(visit => {
      const visitDate = new Date(visit.timeStamp).toLocaleDateString();
      return visitDate === dateStr;
    }).length;
  }
  
  return result;
}

function getLast30DaysClicks(visitHistory) {
  const result = {};
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString();
    
    result[dateStr] = visitHistory.filter(visit => {
      const visitDate = new Date(visit.timeStamp).toLocaleDateString();
      return visitDate === dateStr;
    }).length;
  }
  
  return result;
}

// FIXED MODULE EXPORTS - Make sure ALL functions are included
module.exports = {
  handlePostNewShortUrl,
  handleGetUrlById,
  handleGetAnalyticsById,
  handleGetUserUrls,           // Add this
  handleGetDetailedAnalytics   // Add this
};