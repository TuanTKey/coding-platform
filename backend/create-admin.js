require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("⚠️  Admin account already exists!");
      console.log("Username:", existingAdmin.username);
      console.log("Email:", existingAdmin.email);
      mongoose.disconnect();
      return;
    }

    // Create admin account
    const admin = await User.create({
      username: "admin",
      email: "admin@codejudge.com",
      password: "admin123",
      fullName: "Admin User",
      role: "admin",
      rating: 2000,
      class: "ADMIN",
    });

    console.log("✅ Admin account created successfully!");
    console.log("Username:", admin.username);
    console.log("Email:", admin.email);
    console.log("Password: admin123");
    console.log("\nYou can now login with these credentials.");

    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    mongoose.disconnect();
  }
};

createAdmin();
