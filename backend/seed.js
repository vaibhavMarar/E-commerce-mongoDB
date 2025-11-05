import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/userModel.js";

dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce");
    console.log("✅ Connected to MongoDB");
    
    // Clear existing test users (optional - remove if you want to keep existing data)
    await User.deleteMany({ 
      email: { $in: ["admin@test.com", "user@test.com"] } 
    });

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: "admin123",
      role: "admin"
    });

    // Create regular user
    const user = await User.create({
      name: "Test User",
      email: "user@test.com",
      password: "user123",
      role: "user"
    });

    console.log("✅ Test users created successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔑 ADMIN USER:");
    console.log("   Email: admin@test.com");
    console.log("   Password: admin123");
    console.log("\n👤 REGULAR USER:");
    console.log("   Email: user@test.com");
    console.log("   Password: user123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error.message);
    process.exit(1);
  }
};

seedUsers();

