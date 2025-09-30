const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Name is required"],
        trim: true
    },
    email: { 
        type: String, 
        required: [true, "Email is required"], 
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: [true, "Password is required"] 
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    }
}, { 
    timestamps: true 
});

// Add index for better performance
userSchema.index({ email: 1 });

const User = mongoose.model("users", userSchema);

module.exports = User;