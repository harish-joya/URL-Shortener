require('dotenv').config();
const jwt = require("jsonwebtoken");

const secret = process.env.secret;

if (!secret) {
    console.error("JWT secret is not defined in environment variables");
    process.exit(1);
}

function setUser(user){
    return jwt.sign({
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
    }, secret, { expiresIn: '24h' });
}

function getUser(token){
    if(!token) return null;
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        console.error("JWT verification error:", error.message);
        return null;
    }
}

module.exports = {
    setUser,
    getUser
};