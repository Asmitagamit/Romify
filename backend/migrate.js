// migrate.js
const mongoose = require("mongoose");
const User = require("./models/User"); // Ensure path is correct
const PG = require("./models/pg");     // Ensure path is correct

// 1. Connect to your local MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/rommify")
  .then(async () => {
    console.log("🚀 Starting Data Migration...");

    // TASK A: Fix existing Users
    // Add an empty favorites array [] only to users who don't have the field yet
    const userResult = await User.updateMany(
      { favorites: { $exists: false } }, 
      { $set: { favorites: [] } }
    );
    console.log(`👤 Users Patched: ${userResult.modifiedCount}`);

    // TASK B: Fix existing PGs
    // Add totalLikes: 0 only to PGs that are missing the field
    const pgResult = await PG.updateMany(
      { totalLikes: { $exists: false } }, 
      { $set: { totalLikes: 0 } }
    );
    console.log(`🏠 PGs Patched: ${pgResult.modifiedCount}`);

    console.log("✅ Migration Successful! Your database is now up to date.");
    process.exit(0); // Close the script
  })
  .catch(err => {
    console.error("❌ Migration Failed:", err);
    process.exit(1);
  });