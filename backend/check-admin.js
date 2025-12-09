require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require("./src/models/User");

  const admin = await User.findOne({ username: "admin" });

  console.log("=== ADMIN ACCOUNT STATUS ===");
  if (admin) {
    console.log("✅ Admin found!");
    console.log("Username:", admin.username);
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("FullName:", admin.fullName);
    console.log("Password Hash:", admin.password.substring(0, 20) + "...");
    console.log("\nTrying to compare password...");

    const isMatch = await admin.comparePassword("admin123");
    console.log('Password "admin123" matches:', isMatch);
  } else {
    console.log("❌ Admin not found!");
    console.log("\nAll users in database:");
    const allUsers = await User.find({}, "username email role");
    console.log(allUsers);
  }

  mongoose.disconnect();
});
