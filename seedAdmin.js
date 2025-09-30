require('dotenv').config();

const connectToMongoDb = require('./connection');
const User = require('./models/user');

async function createAdminUser() {
    try {
        const MONGODB_URI = process.env.MONGO_URL; // Changed to MONGO_URL
        
        if (!MONGODB_URI) {
            console.error("ERROR: MONGO_URL is not defined in environment variables");
            process.exit(1);
        }

        console.log("Connecting to MongoDB...");
        await connectToMongoDb(MONGODB_URI);
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@urlshortener.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        await User.create({
            name: 'System Admin',
            email: 'admin@urlshortener.com',
            password: 'admin123',
            role: 'admin'
        });

        console.log('Admin user created successfully!');
        console.log('Email: admin@urlshortener.com');
        console.log('Password: admin123');
        console.log('IMPORTANT: Change this password after first login!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error.message);
        process.exit(1);
    }
}

createAdminUser();