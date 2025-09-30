const {getUser} = require("../service/auth");

async function restrictToLoggedInUserOnly(req, res, next){
    const userUID = req.cookies?.uid;
    
    if(!userUID) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    const user = getUser(userUID);
    if(!user) {
        return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
}

async function checkAuth(req, res, next){
    const userUID = req.cookies?.uid;

    if(userUID) {
        const user = getUser(userUID);
        req.user = user;
    } else {
        req.user = null;
    }
    
    next();
}

module.exports = {
    restrictToLoggedInUserOnly,
    checkAuth
};