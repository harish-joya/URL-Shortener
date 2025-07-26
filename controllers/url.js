const User = require("../models/user");
const { nanoid } = require("nanoid");
const URL = require("../models/url");
const { setUser, getUser } = require("../service/auth");


async function handlePostNewShortUrl(req, res) {
    const sessionId = req.cookies?.uid;
    const user = getUser(sessionId);

    if (!user) return res.redirect("/login");

    const body = req.body;
    if (!body.url) return res.status(400).json({ error: "URL is required" });

    // Check if URL already exists for the user
    const existing = await URL.findOne({
        redirectURl: body.url,
        createdBy: user._id,
    });

    if (existing) {
        const urls = user.role === "admin"
            ? await URL.find().populate("createdBy", "name email")
            : await URL.find({ createdBy: user._id });

        return res.render(user.role === "admin" ? "admin" : "home", {
            id: existing.shortId,
            name: user.name,
            urls,
        });
    }

    // If not existing, create a new short URL
    const shortId = shortid();

    await URL.create({
        shortId,
        redirectURl: body.url,
        visitHistory: [],
        createdBy: user._id,
    });

    const urls = user.role === "admin"
        ? await URL.find().populate("createdBy", "name email")
        : await URL.find({ createdBy: user._id });

    return res.render(user.role === "admin" ? "admin" : "home", {
        id: shortId,
        name: user.name,
        urls,
    });
}


async function handleGetUrlById(req, res) {
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

    if (!entry) return res.status(404).send("Short URL not found");
    res.redirect(entry.redirectURl);
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

async function handleHomePage(req, res) {
    const sessionId = req.cookies?.uid;
    const user = getUser(sessionId);

    if (!user) return res.redirect("/login");

    if (user.role === "admin") {
        return res.redirect("/admin");
    }

    const urls = await URL.find({ createdBy: user._id });

    return res.render("home", {
        urls,
        name: user.name,
        role: user.role,
    });
}



async function handleAdminPage(req, res) {
    const user = getUser(req.cookies.uid);
    if (!user || user.role !== "admin") {
        return res.status(403).send("Access Denied");
    }

    const urls = await URL.find({}).populate('createdBy', 'name email');
    res.render("admin", { name: user.name, urls });
}

async function handleAdminLoginPost (req, res){
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });

    if (!user || user.role !== "admin") {
        return res.render("admin_login", { error: "Invalid admin credentials." });
    }

    const token = setUser(user);
    res.cookie("uid", token);
    return res.redirect("/admin");
}


module.exports = {
    handlePostNewShortUrl,
    handleGetUrlById,
    handleGetAnalyticsById,
    handleHomePage,
    handleAdminPage,
    handleAdminLoginPost
};
