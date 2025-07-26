const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: String,
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    }
    },  {timestamps: true}
);

const User = mongoose.model("users", userSchema);

module.exports = User;